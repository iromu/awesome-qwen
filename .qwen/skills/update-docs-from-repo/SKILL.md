---
name: update-docs-from-repo
description: Procedure for fetching and updating documentation from a specific GitHub repository, creating structured doc files, updating the index, and refreshing memory
source: auto-skill
extracted_at: '2026-06-07T08:59:10.064Z'
metadata:
   internal: true
---

## Procedure: Update Documentation from a GitHub Repository

When asked to update existing documentation by fetching content from a GitHub repository (especially for companion projects like servers, tools, or infrastructure):

### Step 1: Discover the Repository Structure

1. **Fetch the main repo page** — use `web_fetch` on `https://github.com/<org>/<repo>` with `prompt="Summarize the structure and content of this repository. List all markdown files, directories, and key documentation."`
2. **Check existing local docs** — list the target docs directory (e.g., `raw/<project-name>-docs/`) to see what's already there and what's missing.
3. **Identify gaps** — compare what the repo has vs what's already stored locally.

### Step 2: Fetch the Content

**For README files:**
- Use `web_fetch` on `https://raw.githubusercontent.com/<org>/<repo>/main/README.md` with `prompt="Return the full content of this file verbatim."`
- The README may be truncated on first fetch — re-fetch to get the rest if needed.

**For other markdown files:**
- Use `https://raw.githubusercontent.com/<org>/<repo>/main/<path>` for clean markdown content.
- Use `prompt="Return the full content of this file verbatim."`

**For directory listings:**
- Use `https://github.com/<org>/<repo>/tree/main/<path>` to discover file paths.

**Handle truncation:**
- If the README is large, it may be truncated. Re-fetch with the same URL to get the remaining content.
- Split large fetches by section if the content is too large for a single fetch.

### Step 3: Create Structured Documentation

1. **Create the target directory**: `mkdir -p raw/<project-name>-docs/<subdir>`
2. **Write the doc file** with:
   - Clear heading: `# <Project> <Topic>`
   - Source attribution: `Source: https://github.com/<org>/<repo>`
   - Well-structured sections with headings, code blocks, and tables
   - Preserve all code examples, configuration tables, and API details
3. **Organize by topic** — group related docs in subdirectories (e.g., `guide/`, `reference/`, `setup/`).

### Step 4: Update the INDEX

1. **Read the existing INDEX.md** in the target docs directory.
2. **Add the new file** to the Files section with a one-line description answering: **what does a coding agent get from reading this?**
3. **Update the Sources line** to include the new repo URL if it wasn't there before.

### Step 5: Update Memory

1. **Check the existing memory file** for the project (e.g., `~/.qwen/projects/<project-path>/memory/<project-name>-docs.md`).
2. **Update the sources covered** list to include the new repository.
3. **Update the coverage description** to mention new topics now covered (e.g., server setup, MCP integrations, Docker deployment).
4. **Update file count** if it has changed significantly.

### Key Considerations

- **Companion projects**: Repos like `embabel/guide` are companion projects that serve as servers/tools for the main framework. They often contain operational docs (deployment, MCP integration, testing) that the main framework README doesn't cover.
- **README truncation**: Large READMEs may be truncated on first fetch. Always check if content was complete and re-fetch if needed.
- **Source attribution**: Always include the original GitHub URL in the doc file for traceability.
- **Structured output**: Don't just dump raw content — organize it with clear headings, preserve code blocks and tables, and make it actionable for a coding agent.
