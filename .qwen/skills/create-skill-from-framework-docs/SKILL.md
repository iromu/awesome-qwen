---
name: create-skill-from-framework-docs
description: Procedure for gathering extensive framework documentation to prepare for creating one or more skills
source: auto-skill
extracted_at: '2026-06-04T00:45:00.000Z'
metadata:
  internal: true
---

## Procedure: Gather Framework Documentation for Skill Creation

When asked to fetch documentation from a Java/Kotlin framework (especially one that builds agents, tools, or AI systems) to prepare for creating skills:

### Step 1: Discover the Project

1. **Search for the project** — try common URL patterns:
   - `https://github.com/<org>/<repo>`
   - `https://docs.<project>.com` or `https://<project>.com/docs`
   - GitHub search: `https://github.com/search?q=<project>+type:repo`
2. **Fetch the main README** from `https://raw.githubusercontent.com/<org>/<repo>/main/README.md`
3. **Identify the project structure** — look for module names, sub-projects, templates, examples, and documentation sources mentioned in the README.

### Step 2: Discover the Documentation Site

1. **Find the docs URL** — usually mentioned in the README as a link or badge.
2. **Fetch the docs landing page** to get the full table of contents.
3. **Note the version** used in the URL (e.g., `0.1.2-SNAPSHOT` vs `0.5.0-SNAPSHOT`) — different versions may have different content.

### Step 3: Fetch Documentation Content

**From the docs site:**
- Fetch the main docs page to get the full TOC with all section URLs.
- Fetch individual reference pages by section (tools, states, annotations, RAG, testing, etc.).
- Use `prompt="Extract ALL content from this file. Include all code examples, configuration details, and descriptions. Do not summarize."`
- **Monolithic page pattern**: Some docs sites (e.g., Embabel's `docs.embabel.com`) serve all content on the main URL rather than individual pages. Individual section URLs may return 404. Always fetch the main page first and extract everything from it.
- **Version-specific content**: Different versions can have significantly different content. The README may reference one version (e.g., `0.1.2-SNAPSHOT`) while the actual docs site uses another (e.g., `0.5.0-SNAPSHOT`). Fetch the version from the docs site URL, not just the README.

**From GitHub:**
- Fetch READMEs from all major modules: `embabel-agent-api`, `embabel-agent-skills`, `embabel-agent-rag`, etc.
- Fetch template project READMEs (Java template, Kotlin template).
- Fetch examples repository READMEs.
- Fetch the `pom.xml` structure to understand module organization.
- Use the GitHub tree view (`https://github.com/<org>/<repo>/tree/main/<path>`) to discover actual file paths when raw URLs return 404.

**Handle AsciiDoc-based docs:**
- AsciiDoc projects often use `page.adoc` as the filename within each section directory.
- Use the GitHub tree API to discover actual file paths: `https://github.com/<org>/<repo>/tree/main/<path>`
- Raw content URL pattern: `https://raw.githubusercontent.com/<org>/<repo>/main/<path>/page.adoc`
- If raw URLs return 404, the file may have a different name — discover via the tree view.

**Fetch in parallel batches** — multiple READMEs, module docs, and reference pages can be fetched simultaneously.

### Step 3b: Fetch Multiple Versions (Recommended)

For frameworks with active development, fetch docs from **both old and new versions** to capture:
- Stable reference content (older version)
- New features and changes (newer version)
- Configuration property additions
- New annotations, planners, or patterns

Example: Fetch both `0.1.2-SNAPSHOT` and `0.5.0-SNAPSHOT` from the same docs site. Store version-specific files with clear naming (e.g., `01-tools.md` for old version, `05-tools-050.md` for new version).

### Step 4: Handle Common Pitfalls

- **404 on raw GitHub URLs**: The file may be in a different branch (`main` vs `master`), have a different name, or be in a different location. Use the GitHub tree view to discover the actual path.
- **404 on individual doc pages**: The site may serve a monolithic page. Fetch the main docs URL and extract everything from it.
- **Version mismatch**: The README may reference one version (e.g., `0.1.2-SNAPSHOT`) while the actual docs site uses another (e.g., `0.5.0-SNAPSHOT`). Use the version from the README.
- **AsciiDoc `page.adoc` pattern**: Many sections in AsciiDoc-based docs sites use `page.adoc` as the filename within each subdirectory.
- **Rate limiting**: If fetches fail, retry with different approaches (raw GitHub vs web fetch).
- **Large content**: The web_fetch tool may truncate very large pages. Split into targeted fetches by section.

### Step 5: Organize and Save

1. **Create the target directory**: `mkdir -p raw/<project-name>-docs/{core,reference,examples,tools,sdk}`
2. **Name files descriptively** with numbered prefixes and clear names:
   - `core/01-overview-and-core-concepts.md`
   - `core/02-getting-started.md`
   - `reference/01-tools.md`
   - `reference/02-states.md`
   - `reference/03-agent-skills.md`
3. **Include source attribution** at the top of each file:
   ```markdown
   # <Title>
   Source: <original URL>
   ```
4. **Create an INDEX.md** in the root of the docs folder that:
   - Lists all files and their purposes
   - Summarizes key concepts, annotations, interfaces, and patterns
   - Links to related repositories and resources

### Step 6: Verify Sufficient Material

After fetching, verify:
- All files are saved in the target directory
- File sizes are reasonable (not empty or truncated)
- Total content covers:
  - Framework overview and architecture
  - Getting started / setup
  - Core API (annotations, interfaces, types)
  - Tools and extensibility
  - Agent/skill-related documentation
  - Testing patterns
  - Examples and templates
- Aim for 10+ files with substantial content (500+ lines total)

### Key Framework Concepts to Capture

For agent/AI frameworks specifically, ensure you capture:
- **Agent model**: How agents are defined, invoked, and composed
- **Actions/Steps**: How individual actions are defined with annotations
- **Goals/Conditions**: How goals and conditions drive planning
- **State management**: How state transitions work (if applicable)
- **Tools**: How tools are implemented, exposed, and grouped
- **Planning algorithms**: GOAP, Utility AI, Supervisor, etc.
- **Domain objects**: How domain models integrate with agents
- **Skills**: How skills are loaded, structured, and executed
- **RAG**: How retrieval-augmented generation is supported
- **Testing**: How agents and actions are tested
- **Chatbots**: How conversational interfaces are built
- **Configuration**: How the framework is configured (properties, beans)
