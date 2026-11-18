# Awesome Qwen website

The Astro site for this repository: a browsable catalog of the skills under
[`skills/`](../skills) with their SkillEvaluator quality scores, plus the
coding rules under [`rules/`](../rules), published to GitHub Pages at
<https://iromu.github.io/awesome-qwen/>.

## Architecture

- **Framework:** Astro (static output) + React 19 via `@astrojs/react`, styled
  with `@primer/react-brand` design tokens. No CMS, no database — every page is
  prerendered at build time.
- **Routes:** `/` (home with featured skills and the rules list), `/skills/`
  and `/rules/` (catalogs with filters/sort/search), `/skill/<id>/` (one detail
  page per skill: rendered `SKILL.md`, bundled-file browser, Quality Score
  panel), `/rule/<id>/` (one detail page per rule: rendered markdown, its
  `paths:` globs, and the `curl` install command).
- **Data pipeline:** `scripts/generate-website-data.mjs` scans `../skills/`,
  `../reports/skillevaluator/`, and `../rules/`, then writes
  `public/data/skills.json`, `public/data/rules.json`, and
  `public/data/search-index.json`. These files are **generated and gitignored** —
  never edit them by hand.
- **Search:** the in-memory index (`search-index.json`, rendered into
  `TopNavSearch`) plus a Pagefind index built post-build by the
  `pagefind-resources` Astro integration. Both carry skill *and* rule records; a
  new resource type has to be registered in `searchIndex.ts`,
  `pagefindSearch.ts`, `pagefind-resources.ts`, `pageHref.ts`, and
  `navigation.ts`.

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
`/rules/`, two representative skill detail pages, and one rule detail page, in
both themes.

CI blocks on critical and serious violations; minor and moderate best-practice
issues are reported as non-blocking.

Authoring conventions: resource cards use `div[role="listitem"]` wrappers, not
`<article>`; only add `role="list"` to containers whose direct children are
list items; do not nest interactive controls inside another focusable element;
`.btn-primary` and ToC links must meet WCAG AA (4.5:1) contrast in both light
and dark themes.

## Rendering gotchas found building the Rules section

- **Primer Brand's `Card` matches its subcomponents by type inside
  `props.children`.** A helper that returns `<><Card.Heading/><Card.Description/></>`
  makes both vanish — the fragment hides them from the lookup, so the card
  renders only its action arrow. Pass the slots as *direct* children of `Card`.
- **Anything that is not a `Card.*` slot is dropped**, so extra content (a rule's
  glob, say) must ride inside `Card.Description`, not beside it.
- **A block-level `<span>` child of `Card.Description` gets unwrapped** out of
  the rendered `<p>`, which is what puts it on its own line.
- **Long path globs need explicit break points.** Letting the browser wrap
  `**/prompts/**/*.{j2,jinja,jinja2}` splits the brace set across lines;
  `word-break: keep-all` does nothing for non-CJK text. `RuleGlob.tsx` inserts
  `<wbr>` between path segments instead, and `.cardGlob` forbids other breaks.
- **JSX and CSS comments cannot contain a glob literal**: `*/` inside `/* … */`
  ends the comment early, and `{…}` inside a JSX comment is parsed as an
  expression. Both fail the build with a bare "Unexpected token".

## Security hardening notes

- The site ships with a baseline meta CSP and `referrer` policy in
  `src/layouts/BaseLayout.astro`.
- Because the site is hosted on GitHub Pages, response headers are not
  controllable in-repo. For stricter enforcement (for example, header-based CSP
  with nonce/hashes), place the site behind infrastructure that can set HTTP
  security headers.
- Markdown rendered for detail/file-browser experiences is sanitized with the
  shared `sanitizeHtml()` helper before insertion.
