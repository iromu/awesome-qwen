---
name: fetch-and-organize-external-docs
description: Procedure for fetching documentation from external projects and organizing it into a structured local folder
source: auto-skill
extracted_at: '2026-06-04T00:21:00.000Z'
metadata:
  internal: true
---

## Procedure: Fetch and Organize External Documentation

When asked to gather documentation from an external project/repository for the purpose of building a skill or reference material:

### Step 1: Discover the Documentation Sources

1. **Start with the primary web property** — fetch the main site URL (e.g., `https://docs.example.com` or `https://example.com`) to discover the navigation structure, all documentation links, and URL patterns.
2. **Find the GitHub repository** — fetch the main README from `https://github.com/<org>/<repo>` and also try `https://raw.githubusercontent.com/<org>/<repo>/main/README.md` for clean raw text.
3. **Identify sub-projects** — look for related repositories (templates, examples, companion projects) mentioned in the main README.

### Step 2: Fetch Documentation Content

**Prefer raw GitHub content** when available:
- Use `https://raw.githubusercontent.com/<org>/<repo>/main/<path>` for README files, CONTRIBUTING files, and other markdown docs.
- This avoids HTML parsing issues and gives clean markdown.

**For documentation sites** (e.g., Docusaurus, MkDocs):
- Fetch the main docs page first to discover the full table of contents and navigation structure.
- Try common URL patterns for individual pages:
  - `/section-slug.html`
  - `/section-slug`
  - `/index.html`
  - Fragment identifiers: `#sub-section-anchor`
- If individual pages return 404, the site may serve a monolithic page — fetch the main page and extract all content from it.
- Use the `prompt` parameter to request verbatim content extraction, not summaries.

**Fetch in parallel batches** when possible — multiple READMEs, module docs, and template docs can be fetched simultaneously.

### Step 3: Handle Common Pitfalls

- **404 on individual doc pages**: The site may serve a monolithic/SPA page. Fetch the main docs URL and extract everything from it.
- **HTML vs Markdown**: Prefer `raw.githubusercontent.com` URLs for clean markdown. If fetching HTML, use the web_fetch tool with `prompt="Extract the FULL content verbatim. Do not summarize."`
- **Rate limiting**: If fetches fail, retry with different approaches (raw GitHub vs web fetch).
- **Large content**: The web_fetch tool may truncate very large pages. Split into targeted fetches by section.

### Step 4: Organize and Save

1. **Create the target directory**: `mkdir -p raw/<project-name>-docs`
2. **Name files descriptively**: Use numbered prefixes and clear names:
   - `01-main-readme.md`
   - `02-examples-readme.md`
   - `03-module-docs.md`
3. **Include source attribution**: At the top of each file, include:
   ```markdown
   # <Title>
   Source: <original URL or GitHub repo URL>
   ```
4. **Aim for completeness**: Fetch all major documentation surfaces:
   - Main README
   - Examples/tutorials README
   - Module-specific READMEs
   - Template project READMEs
   - Contributing guides
   - Scripts/runners documentation
   - Related project READMEs (companion projects mentioned in docs)
   - Maven/pom.xml structure (for Java projects)

### Step 5: Verify

After fetching, verify:
- All files are saved in the target directory
- File sizes are reasonable (not empty or truncated)
- Total content covers the major documentation surfaces of the project
