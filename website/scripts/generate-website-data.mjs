/**
 * Generate the website's build-time data feeds.
 *
 * Scans the repo's `skills/` directory and the per-skill validation reports in
 * `reports/skillevaluator/` and writes two JSON files into `public/data/`:
 *
 *   - skills.json       catalog + detail pages (`{ items: [...] }`)
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

/** ISO date (UTC) of the last commit touching the skill folder, falling back
 *  to the SKILL.md mtime when git has no history for it (fresh clone, shallow
 *  checkout, or untracked file). `fetch-depth: 0` in the deploy workflows is
 *  what makes the git-based date reliable in CI. */
function lastUpdated(skillName, skillMdPath) {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", `skills/${skillName}`],
      { cwd: repoRoot, encoding: "utf8" },
    ).trim();
    if (iso) return iso.slice(0, 10);
  } catch {
    /* git unavailable — fall through to mtime */
  }
  return new Date(fs.statSync(skillMdPath).mtimeMs).toISOString().slice(0, 10);
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

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "skills.json"),
  `${JSON.stringify({ items }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outputDir, "search-index.json"),
  `${JSON.stringify(searchIndex, null, 2)}\n`,
);

const withScore = items.filter((item) => item.qualityScore).length;
console.log(
  `Wrote ${items.length} skill(s) (${withScore} with a quality score) to ${path
    .relative(repoRoot, outputDir)
    .replace(/\\/g, "/")}/`,
);
