# Awesome Qwen website

The Astro site for this repository: a browsable catalog of the skills under
[`skills/`](../skills) with their SkillEvaluator quality scores, published to
GitHub Pages at <https://iromu.github.io/awesome-qwen/>.

## Architecture

- **Framework:** Astro (static output) + React 19 via `@astrojs/react`, styled
  with `@primer/react-brand` design tokens. No CMS, no database — every page is
  prerendered at build time.
- **Routes:** `/` (home with featured skills), `/skills/` (catalog with
  filters/sort/search), `/skill/<id>/` (one detail page per skill: rendered
  `SKILL.md`, bundled-file browser, Quality Score panel).
- **Data pipeline:** `scripts/generate-website-data.mjs` scans `../skills/` and
  `../reports/skillevaluator/` and writes `public/data/skills.json` +
  `public/data/search-index.json`. These files are **generated and gitignored** —
  never edit them by hand.
- **Search:** the in-memory index (`search-index.json`, rendered into
  `TopNavSearch`) plus a Pagefind index built post-build by the
  `pagefind-resources` Astro integration.

## Local development

Run these from the **`website/` directory** (there is no root `package.json`):

```bash
npm ci                    # install dependencies (first time / after lockfile changes)
npm run data              # regenerate public/data/*.json from skills/ + reports/
npm run dev               # start the dev server (run `npm run data` first on a fresh clone)
npm run build             # regenerate data, then a full production build into dist/
```

The dev server and build read `public/data/*.json` statically, so a fresh clone
must run `npm run data` once before `npm run dev` (or just use
`npm run build`, which chains both).

The site is built under the `/awesome-qwen` base path (GitHub Pages project
site). Set `SITE_URL`/`SITE_BASE` env vars before `astro build` to build for a
different host or base.

## Quality Score data

Each skill detail page renders a **Quality Score** panel (overall score, grade,
skill type, and the four dimension scores) parsed from the matching
`reports/skillevaluator/<skill>.md` report. The catalog cards and the home-page
"Featured skills" grid read the same data. Regenerate reports with
`../evaluate_skills.sh`, then rerun `npm run data` and rebuild to refresh the
site. Skills without a report render no panel (the site never invents scores).

## Accessibility

`npm run a11y` (from `website/`, after a build) runs the automated axe-core +
Playwright audit against `dist` via `astro preview`. It checks `/`, `/skills/`,
and two representative skill detail pages in both themes.

CI blocks on critical and serious violations; minor and moderate best-practice
issues are reported as non-blocking.

Authoring conventions: resource cards use `div[role="listitem"]` wrappers, not
`<article>`; only add `role="list"` to containers whose direct children are
list items; do not nest interactive controls inside another focusable element;
`.btn-primary` and ToC links must meet WCAG AA (4.5:1) contrast in both light
and dark themes.

## Security hardening notes

- The site ships with a baseline meta CSP and `referrer` policy in
  `src/layouts/BaseLayout.astro`.
- Because the site is hosted on GitHub Pages, response headers are not
  controllable in-repo. For stricter enforcement (for example, header-based CSP
  with nonce/hashes), place the site behind infrastructure that can set HTTP
  security headers.
- Markdown rendered for detail/file-browser experiences is sanitized with the
  shared `sanitizeHtml()` helper before insertion.
