import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import matter from "gray-matter";
import { enhanceMarkdownA11y } from "./markdown-a11y";
import { sanitizeHtml } from "./sanitize-html";

/**
 * Build-time helpers shared by the skill detail page (src/pages/skill/[id].astro).
 *
 * This module is intentionally free of any DOM/browser dependencies so it can
 * run in Astro frontmatter at build time (unlike src/scripts/utils.ts, which is
 * client-side).
 */

// Repo root. Astro runs (both `dev` and `build`) execute with the website/
// directory as the working directory, so the repo root is its parent. This is
// resolved from the working directory rather than `import.meta.url` because the
// latter is unreliable once this module is bundled during a production build.
const repoRoot = path.resolve(process.cwd(), "..");

export function formatLastUpdated(
  lastUpdated?: string | null
): string | null {
  return lastUpdated
    ? new Date(lastUpdated).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
}

/**
 * Detail pages render a hero `<h1>` from frontmatter (see DetailChassis), but
 * the resource's own markdown document typically starts with its own `# Title`
 * — usually the same title restated. Left in place, that renders as a second
 * `<h1>` in the page's heading outline. Strip only the first leading `<h1>`
 * (whichever heading level `marked` gave the document's opening `#`), since the
 * hero already carries that title; keep any subsequent headings intact.
 */
function stripLeadingH1(html: string): string {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/, "");
}

/**
 * Read a skill's SKILL.md at build time and return its rendered HTML, the
 * trimmed frontmatter block, and the raw file contents.
 */
export function readSkillMarkdown(filePath: string): {
  markdownHtml: string;
  frontmatterText: string;
  rawMarkdown: string;
} {
  let markdownHtml = "";
  let frontmatterText = "";
  let rawMarkdown = "";
  try {
    const raw = fs.readFileSync(path.join(repoRoot, filePath), "utf-8");
    rawMarkdown = raw;
    const parsed = matter(raw);
    frontmatterText = parsed.matter?.trim() ?? "";
    markdownHtml = enhanceMarkdownA11y(
      stripLeadingH1(
        sanitizeHtml(marked.parse(parsed.content, { async: false }) as string)
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[detail-page] Failed to read or parse markdown for "${filePath}": ${message}`
    );
    markdownHtml = "";
  }
  return { markdownHtml, frontmatterText, rawMarkdown };
}
