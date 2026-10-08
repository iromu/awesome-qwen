import { execFile, spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const require = createRequire(import.meta.url);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const websiteDir = path.resolve(scriptDir, '..');
const distDir = path.join(websiteDir, 'dist');
const axeMainPath = require.resolve('axe-core');
const axeSourcePath = path.join(path.dirname(axeMainPath), 'axe.min.js');

// Resolve Astro's CLI entry point so the preview server can be launched with `node <bin>`
// directly — no shell and no `npx` shim. This keeps signal delivery / detached-PGID shutdown
// predictable (see startPreviewServer) and works identically on Windows and POSIX (spawning a
// .cmd shim without a shell throws EINVAL on modern Node).
const astroPackageJsonPath = require.resolve('astro/package.json');
const astroBinField = require(astroPackageJsonPath).bin;
const astroBinRelative = typeof astroBinField === 'string' ? astroBinField : astroBinField.astro;
const astroBinPath = path.join(path.dirname(astroPackageJsonPath), astroBinRelative);

// Astro serves the site under this base path (see `base` in astro.config.mjs);
// the preview server 404s unprefixed paths, so audit routes must carry it.
const siteBase = (process.env.A11Y_SITE_BASE || '/awesome-qwen').replace(/^\/+|\/+$/g, '');

const routes = [
  '/',
  '/skills/',
  // Representative detail pages (a resource-based and a guide-only skill) so
  // the audit covers the shared detail layout, sidebar, install buttons, and
  // file browser.
  '/skill/htmx/',
  '/skill/docker-containerize/',
];

const themes = ['dark', 'light'];
const blockingImpacts = new Set(['critical', 'serious']);
const serverTimeoutMs = 60_000;
const fetchTimeoutMs = 2_000;

async function main() {
  const port = getPort();
  const providedBaseUrl = process.env.A11Y_BASE_URL?.trim();
  const baseUrl = providedBaseUrl || `http://localhost:${port}/`;
  let previewServer;
  let browser;

  try {
    await access(axeSourcePath);

    if (!providedBaseUrl) {
      await access(distDir);
      previewServer = startPreviewServer(port);
    }

    await waitForServer(new URL(`/${siteBase}/`, baseUrl).toString(), previewServer);

    browser = await chromium.launch();
    const violations = await auditSite(browser, baseUrl);
    printReport(violations);

    // Gate only critical and serious violations; moderate/minor findings are reported but non-blocking.
    const blockingCount = violations.filter((violation) => blockingImpacts.has(violation.impact)).length;
    const nonBlockingCount = violations.length - blockingCount;

    console.log(
      `\nSummary: ${blockingCount} blocking (critical/serious), ${nonBlockingCount} non-blocking (moderate/minor) violation(s).`,
    );

    if (blockingCount > 0) {
      process.exitCode = 1;
      console.error(`Accessibility audit FAILED — ${blockingCount} blocking violation(s)`);
    } else {
      process.exitCode = 0;
      console.log('Accessibility audit PASSED (no critical/serious violations)');
    }
  } catch (error) {
    process.exitCode = 1;
    console.error(`Accessibility audit ERROR — ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await closeBrowser(browser);
    await stopPreviewServer(previewServer);
  }
}

function getPort() {
  const port = Number.parseInt(process.env.A11Y_PORT || '4322', 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid A11Y_PORT value: ${process.env.A11Y_PORT}`);
  }

  return port;
}

function startPreviewServer(port) {
  // Launch `node <astro-bin> preview` directly — no shell layer and no npx shim. A shell
  // (shell:true) spawns an extra intermediate process that makes signal delivery / PGID-based
  // shutdown (detached + process.kill(-pid) below) unreliable, and spawning the npx.cmd shim
  // without a shell throws EINVAL on modern Node for Windows. Invoking the resolved bin with
  // process.execPath sidesteps both problems on every platform.
  const child = spawn(process.execPath, [astroBinPath, 'preview', '--port', String(port), '--host'], {
    cwd: websiteDir,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const server = {
    child,
    exited: false,
    exitCode: null,
    signal: null,
    spawnError: null,
    logs: [],
  };

  const rememberOutput = (chunk) => {
    const lines = String(chunk)
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean);

    server.logs.push(...lines);

    if (server.logs.length > 60) {
      server.logs.splice(0, server.logs.length - 60);
    }
  };

  child.stdout.on('data', rememberOutput);
  child.stderr.on('data', rememberOutput);
  child.on('error', (error) => {
    server.spawnError = error;
    rememberOutput(`Failed to start preview server: ${error.message}`);
  });
  child.on('exit', (code, signal) => {
    server.exited = true;
    server.exitCode = code;
    server.signal = signal;
  });

  return server;
}

async function waitForServer(url, server) {
  const deadline = Date.now() + serverTimeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    if (server?.spawnError) {
      throw new Error(`${server.spawnError.message}${formatServerLogs(server)}`);
    }

    try {
      const response = await fetchWithTimeout(url);

      if (response.ok) {
        return;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    // `astro preview` daemonizes on this platform: the CLI parent exits
    // (code 0) once the detached server is up, so an early clean child exit
    // is not itself a failure — keep polling the port and let the deadline
    // decide. A non-zero exit means the CLI really failed to start it.
    if (server?.exited && server.exitCode !== 0) {
      break;
    }

    await delay(500);
  }

  throw new Error(
    `Timed out after ${serverTimeoutMs / 1000}s waiting for ${url}.${
      lastError ? ` Last error: ${lastError.message}` : ''
    }${formatServerLogs(server)}`,
  );
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function auditSite(browser, baseUrl) {
  const page = await browser.newPage();
  const violations = [];

  for (const route of routes) {
    for (const theme of themes) {
      const path = `/${siteBase}${route}`.replace(/\/{2,}/g, '/');
      const url = new URL(path, baseUrl).toString();
      await page.emulateMedia({ colorScheme: theme });

      // 'load' (not 'networkidle') keeps the audit robust: cards are server-rendered
      // into the initial HTML, and lazy images / search-index requests can otherwise
      // keep the network busy indefinitely and stall navigation.
      const response = await page.goto(url, { waitUntil: 'load', timeout: 45_000 });

      // Fail fast on broken/missing routes. page.goto() resolves even for 4xx/5xx responses,
      // so without this check axe would run against an error page and the guardrail could
      // "pass" while silently masking a broken route.
      if (!response) {
        throw new Error(`No navigation response for ${url} (theme: ${theme}).`);
      }

      if (!response.ok()) {
        throw new Error(`Route ${url} (theme: ${theme}) returned HTTP ${response.status()}.`);
      }

      await page.waitForTimeout(500);

      // Disable CSS transitions/animations before switching themes. Theme changes animate
      // background/text colors over ~0.2s; if axe runs mid-transition it samples intermediate
      // colors (e.g. a dark card background bleeding through a light page) and reports
      // false-positive contrast violations that no real user ever sees. Killing transitions
      // makes axe measure the settled, steady-state colors — the actual conformance target.
      await page.addStyleTag({
        content: '*,*::before,*::after{transition:none!important;animation:none!important;transition-duration:0s!important;animation-duration:0s!important;}',
      });

      // Primer's auto theme and the page bootstrap both read the OS color scheme.
      await page.waitForFunction(
        (selectedTheme) => document.documentElement.getAttribute('data-color-mode') === selectedTheme,
        theme,
      );

      // Let the forced theme settle (style recalc / reflow) before sampling colors.
      await page.waitForTimeout(150);
      await verifyCourseAnchors(page, route);

      await page.addScriptTag({ path: axeSourcePath });

      const results = await page.evaluate(async () => await axe.run(document, { resultTypes: ['violations'] }));

      for (const violation of results.violations) {
        violations.push({
          route,
          theme,
          id: violation.id,
          impact: violation.impact ?? 'unknown',
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodeCount: violation.nodes.length,
        });
      }
    }
  }

  async function verifyCourseAnchors(page, route) {
    if (!route.startsWith('/learning-hub/app-for-beginners/')) return;
    const duplicateIds = await page.locator('main [id]').evaluateAll((elements) => {
      const ids = elements.map((element) => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    if (duplicateIds.length) {
      throw new Error(`Duplicate course IDs on ${route}: ${duplicateIds.join(', ')}`);
    }
    if (route !== '/learning-hub/app-for-beginners/06-canvases/') return;

    const viewport = page.viewportSize();
    try {
      await page.setViewportSize({ width: 1440, height: 960 });
      await page.locator('main a[href="#markdown-fallback"]').first().click();
      await page.waitForFunction(() => {
        const heading = document.getElementById('markdown-fallback');
        if (!heading?.closest('details')?.open) return false;
        let hero = document.querySelector('main h1');
        while (hero && getComputedStyle(hero).position !== 'sticky') hero = hero.parentElement;
        const top = heading.getBoundingClientRect().top;
        return top >= (hero?.getBoundingClientRect().bottom ?? 0) && top < innerHeight;
      });
    } finally {
      if (viewport) await page.setViewportSize(viewport);
    }
  }

  await page.close();
  return violations;
}

function printReport(violations) {
  console.log(`Audited ${routes.length} route(s) across ${themes.length} theme(s).`);

  if (violations.length === 0) {
    console.log('\nNo axe violations found.');
    return;
  }

  const groupedViolations = new Map();

  for (const violation of violations) {
    const pageTheme = `${violation.route} [${violation.theme}]`;
    const pageViolations = groupedViolations.get(pageTheme) || [];

    pageViolations.push(violation);
    groupedViolations.set(pageTheme, pageViolations);
  }

  for (const [pageTheme, pageViolations] of groupedViolations) {
    console.log(`\n${pageTheme}`);

    for (const violation of pageViolations) {
      const gate = blockingImpacts.has(violation.impact) ? 'BLOCKING' : 'NON-BLOCKING';

      console.log(`  - ${violation.id} (${violation.impact}, ${gate})`);
      console.log(`    ${violation.help}`);
      console.log(`    ${violation.helpUrl}`);
      console.log(`    Nodes: ${violation.nodeCount}`);
    }
  }
}

async function closeBrowser(browser) {
  if (!browser) {
    return;
  }

  try {
    await browser.close();
  } catch (error) {
    process.exitCode = 1;
    console.error(`Failed to close browser cleanly: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function stopPreviewServer(server) {
  if (!server || !server.child.pid) {
    return;
  }

  if (server.exited) {
    // Daemon mode: the CLI parent exited, but the detached server it spawned
    // may still be listening. Ask the CLI to stop its preview daemon (best
    // effort — the daemon may already be gone or managed elsewhere).
    await new Promise((resolve) => {
      execFile(
        process.execPath,
        [astroBinPath, 'preview', 'stop'],
        { timeout: 10_000 },
        () => resolve(),
      );
    });
    return;
  }

  await new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve();
      }
    };

    const timeout = setTimeout(() => {
      forceKill(server.child);
      finish();
    }, 5_000);

    server.child.once('exit', finish);

    if (process.platform === 'win32') {
      execFile('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], (error) => {
        if (error && !server.exited) {
          server.child.kill();
        }
      });
      return;
    }

    try {
      process.kill(-server.child.pid, 'SIGTERM');
    } catch {
      server.child.kill('SIGTERM');
    }
  });
}

function forceKill(child) {
  if (!child.pid) {
    return;
  }

  try {
    if (process.platform === 'win32') {
      child.kill();
    } else {
      process.kill(-child.pid, 'SIGKILL');
    }
  } catch {
    try {
      child.kill('SIGKILL');
    } catch {
      // The process already exited.
    }
  }
}

function formatServerLogs(server) {
  if (!server?.logs.length) {
    return '';
  }

  return `\n\nAstro preview output:\n${server.logs.join('\n')}`;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

await main();
