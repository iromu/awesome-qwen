/**
 * Generate the website's build-time data feeds.
 *
 * Scans the repo's `skills/` directory, the per-skill validation reports in
 * `reports/skillevaluator/`, and the `rules/` catalogue, then writes three JSON
 * files into `public/data/`:
 *
 *   - skills.json       catalog + detail pages (`{ items: [...] }`)
 *   - rules.json        rules catalog + detail pages (`{ items: [...] }`)
 *   - search-index.json site-wide search records consumed by `src/lib/site-data.ts`
 *                       and the `pagefind-resources` Astro integration
 *
 * Run from `website/` with `npm run data` (or `node scripts/generate-website-data.mjs`).
 * It must run before `astro build`/`astro dev`: `src/lib/site-data.ts` imports the
 * generated JSON statically, so a missing file fails the build.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

const here = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.resolve(here, "..");
const repoRoot = path.resolve(websiteRoot, "..");

const skillsDir = path.join(repoRoot, "skills");
const rulesDir = path.join(repoRoot, "rules");
const reportsDir = path.join(repoRoot, "reports", "skillevaluator");
const outputDir = path.join(websiteRoot, "public", "data");

/** Files the eval tooling drops into skill folders or leaves behind; never
 *  part of a skill bundle, so keep them out of the file listing. */
const IGNORED_FILES = new Set([
  "-",
  ".pii_results.json",
  ".segfault-docker-hosts.md",
  "gitleaks-report.json",
  ".DS_Store",
]);

/** Recursively list a skill folder's files as `{path, name, size}` records,
 *  with `path` repo-relative (e.g. `skills/htmx/references/htmx.md`). */
function listSkillFiles(skillDir, skillName) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || IGNORED_FILES.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile()) {
        files.push({
          path: `skills/${skillName}/${path.relative(skillDir, abs).split(path.sep).join("/")}`,
          name: entry.name,
          size: fs.statSync(abs).size,
        });
      }
    }
  };
  walk(skillDir);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

/** ISO date (UTC) of the last commit touching `relPath`, falling back to the
 *  given file's mtime when git has no history for it (fresh clone, shallow
 *  checkout, or untracked file). `fetch-depth: 0` in the deploy workflows is
 *  what makes the git-based date reliable in CI. */
function lastUpdatedFor(relPath, fallbackFile) {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", relPath],
      { cwd: repoRoot, encoding: "utf8" },
    ).trim();
    if (iso) return iso.slice(0, 10);
  } catch {
    /* git unavailable — fall through to mtime */
  }
  return new Date(fs.statSync(fallbackFile).mtimeMs).toISOString().slice(0, 10);
}

function lastUpdated(skillName, skillMdPath) {
  return lastUpdatedFor(`skills/${skillName}`, skillMdPath);
}

/**
 * Extract the Quality Score block from a SkillEvaluator report:
 *
 *   ## Quality Score
 *   | Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
 *   |---|---|---|---|---|---|---|---|
 *   | htmx | 89.5 | B | resource-based | 95.0 | 80.0 | 85.0 | 100.0 |
 *
 * Returns `null` (never a fabricated score) when the report or its Quality
 * Score table is absent so the site renders "not evaluated" instead.
 */
function readQualityScore(skillName) {
  const reportPath = path.join(reportsDir, `${skillName}.md`);
  if (!fs.existsSync(reportPath)) return null;
  const text = fs.readFileSync(reportPath, "utf8");

  const status = /\*\*Status:\*\*\s*(.+)/.exec(text)?.[1]?.trim() ?? null;

  const start = text.indexOf("## Quality Score");
  if (start === -1) return null;
  const end = text.indexOf("\n## ", start + 1);
  const section = text.slice(start, end === -1 ? text.length : end);

  const row =
    /^\|\s*([\w.-]+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*([A-F][+-]?)\s*\|\s*([\w-]+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|/m.exec(
      section,
    );
  if (!row) return null;

  const [, score, grade, type, correctness, discoverability, reliability, efficiency] =
    row.slice(1).map((value) => value.trim());

  return {
    score: Number(score),
    grade,
    type,
    status,
    dimensions: {
      correctness: Number(correctness),
      discoverability: Number(discoverability),
      reliability: Number(reliability),
      efficiency: Number(efficiency),
    },
    reportPath: `reports/skillevaluator/${skillName}.md`,
  };
}

function readSkill(skillName) {
  const skillDir = path.join(skillsDir, skillName);
  const skillMdPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) return null;

  const raw = fs.readFileSync(skillMdPath, "utf8");
  const parsed = matter(raw);
  const metadata = parsed.data?.metadata ?? {};

  const description = String(parsed.data?.description ?? "")
    .replace(/\s+/g, " ")
    .trim();

  const files = listSkillFiles(skillDir, skillName);

  return {
    id: skillName,
    title: skillName,
    description,
    category: typeof metadata.category === "string" ? metadata.category : null,
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    version: typeof metadata.version === "string" ? metadata.version : null,
    author: typeof metadata.author === "string" ? metadata.author : null,
    path: `skills/${skillName}`,
    skillFile: `skills/${skillName}/SKILL.md`,
    files,
    assetCount: Math.max(0, files.length - 1),
    lastUpdated: lastUpdated(skillName, skillMdPath),
    qualityScore: readQualityScore(skillName),
  };
}

/** `rules/README.md` is the install guide, not a rule — never a catalog item. */
const RULES_EXCLUDED = new Set(["README.md"]);

/** "typescript-best-practices" → "Typescript Best Practices" (fallback only). */
function titleFromId(id) {
  return id
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/**
 * Read one rule file. A rule is a single markdown file with `description` and
 * `paths:` frontmatter; a rule with no `paths` is a *baseline* rule that Qwen
 * Code injects into every session, which the catalog surfaces as its own facet.
 *
 * The display title is the file's leading `#` heading (the same string the repo
 * README's Rules table uses), falling back to the prettified filename.
 */
function readRule(fileName) {
  const rulePath = path.join(rulesDir, fileName);
  const raw = fs.readFileSync(rulePath, "utf8");
  const parsed = matter(raw);

  const description = String(parsed.data?.description ?? "")
    .replace(/\s+/g, " ")
    .trim();
  // Qwen Code requires a YAML list, but tolerate the scalar form so a stray
  // `paths: "**/*.ts"` still surfaces on the site instead of vanishing.
  const rawPaths = parsed.data?.paths;
  const paths = (Array.isArray(rawPaths) ? rawPaths : rawPaths ? [rawPaths] : [])
    .map((glob) => String(glob).trim())
    .filter(Boolean);

  const id = path.basename(fileName, ".md");
  const body = parsed.content ?? "";

  return {
    id,
    title: /^#\s+(.+?)\s*$/m.exec(body)?.[1] ?? titleFromId(id),
    description,
    paths,
    scope: paths.length > 0 ? "paths" : "baseline",
    path: `rules/${fileName}`,
    size: fs.statSync(rulePath).size,
    lastUpdated: lastUpdatedFor(`rules/${fileName}`, rulePath),
  };
}

if (!fs.existsSync(skillsDir)) {
  console.error(`error: skills directory not found at ${skillsDir}`);
  process.exit(1);
}

const skillNames = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const items = skillNames
  .map((name) => readSkill(name))
  .filter((item) => item !== null);

if (items.length === 0) {
  console.error(`error: no skills with a SKILL.md found under ${skillsDir}`);
  process.exit(1);
}

const searchIndex = items.map((item) => ({
  type: "skill",
  id: item.id,
  title: item.title,
  description: item.description,
  path: item.skillFile,
  searchText: [
    item.title,
    item.description,
    item.category ?? "",
    item.tags.join(" "),
  ].join(" "),
}));

// Rules are optional: an empty catalogue is a valid state, not a build failure,
// because rules.json is imported statically and must always exist.
const ruleItems = fs.existsSync(rulesDir)
  ? fs
      .readdirSync(rulesDir)
      .filter((name) => name.endsWith(".md") && !RULES_EXCLUDED.has(name))
      .sort()
      .map((name) => readRule(name))
  : [];

searchIndex.push(
  ...ruleItems.map((item) => ({
    type: "rule",
    id: item.id,
    title: item.title,
    description: item.description,
    path: item.path,
    searchText: [item.title, item.description, item.paths.join(" ")].join(" "),
  })),
);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "skills.json"),
  `${JSON.stringify({ items }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outputDir, "rules.json"),
  `${JSON.stringify({ items: ruleItems }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outputDir, "search-index.json"),
  `${JSON.stringify(searchIndex, null, 2)}\n`,
);

const withScore = items.filter((item) => item.qualityScore).length;
console.log(
  `Wrote ${items.length} skill(s) (${withScore} with a quality score) and ${ruleItems.length} rule(s) to ${path
    .relative(repoRoot, outputDir)
    .replace(/\\/g, "/")}/`,
);
