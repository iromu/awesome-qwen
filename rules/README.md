# Rules — install guide

Rules are single markdown files with a `description` + `paths:` frontmatter block. Qwen Code
loads them automatically and injects the body into context — unconditionally for rules with no
`paths`, or when a tool call touches a file matching one of the globs for rules that have them.

Because a rule is one file, there is nothing to unpack: you copy it into a `rules/` directory and
it is installed. `npx skills add`-style installers track a whole skill directory (see
`skills-lock.json`, which records a `skillPath` plus a hash); for a single file from a git repo,
fetch the file directly.

> **Note:** the `rules/` directory **in this repo** is the catalogue — a browsing list. Qwen Code
> does not read it. Your copy has to live in one of the three locations below.

## Where rules are loaded from

| Location | Scope | Notes |
|---|---|---|
| `~/.qwen/rules/` | every project on your machine | personal defaults |
| `<project>/.qwen/rules/` | that project | **only read when the folder is trusted** |
| `<extension>/rules/` | while the extension is active | shown as `<extension>:rules/<file>` |

Verified against the installed CLI (Qwen Code 0.28.0): the scan is recursive and takes any `*.md`,
sorted by path, so subdirectories such as `rules/frontend/react.md` are fine. A rule's filename is
only used for display — the `paths:` globs decide when it fires.

## Install one rule from this repo

```bash
mkdir -p .qwen/rules && curl -fsSL \
  https://raw.githubusercontent.com/iromu/awesome-qwen/main/rules/jinja-llm-prompts.md \
  -o .qwen/rules/jinja-llm-prompts.md
```

Or all five at once:

```bash
mkdir -p .qwen/rules && for r in typescript-best-practices react-best-practices \
  python-conventions jinja-best-practices jinja-llm-prompts; do
  curl -fsSL "https://raw.githubusercontent.com/iromu/awesome-qwen/main/rules/$r.md" \
    -o ".qwen/rules/$r.md"
done
ls .qwen/rules
```

| Rule | File | Fires on |
|---|---|---|
| TypeScript Best Practices | [`typescript-best-practices.md`](typescript-best-practices.md) | `**/*.ts` |
| React Best Practices | [`react-best-practices.md`](react-best-practices.md) | `**/*.{jsx,tsx}` |
| Python Conventions | [`python-conventions.md`](python-conventions.md) | `**/*.py` |
| Jinja Best Practices | [`jinja-best-practices.md`](jinja-best-practices.md) | `**/*.{jinja,jinja2,j2}` |
| Jinja for LLM Prompts | [`jinja-llm-prompts.md`](jinja-llm-prompts.md) | prompt-convention paths only |

Prefer the commit SHA over `main` if you want the rule to stop changing under you:

```bash
curl -fsSL \
  https://raw.githubusercontent.com/iromu/awesome-qwen/a251aac/rules/jinja-llm-prompts.md \
  -o .qwen/rules/jinja-llm-prompts.md
```

## Install any single file from any git repo

The pattern is the same everywhere: point at the raw endpoint, name a ref, and write to a path
under a `rules/` directory.

| Host | Raw URL form |
|---|---|
| GitHub | `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>` |
| GitHub Enterprise | `https://raw.<host>/<owner>/<repo>/<ref>/<path>` |
| GitLab.com | `https://gitlab.com/<group>/<project>/-/raw/<ref>/<path>` |
| Gitea/Forgejo | `https://<host>/<owner>/<repo>/raw/commit/<ref>` + path |
| Gist | `https://gist.githubusercontent.com/<user>/<id>/raw/<file>` |

Three variants worth knowing:

```bash
# 1. Pin and verify — the URL can be re-fetched, so check what you got.
sha256sum .qwen/rules/jinja-llm-prompts.md

# 2. Private repo, using the gh CLI instead of a raw URL (works with your gh auth).
gh api repos/OWNER/REPO/contents/rules/my-rule.md --jq .content | base64 -d \
  > .qwen/rules/my-rule.md

# 3. Many files from one repo without a full clone — sparse, blobless checkout.
git clone --filter=blob:none --sparse --depth 1 \
  https://github.com/iromu/awesome-qwen /tmp/aq && \
  git -C /tmp/aq sparse-checkout set rules && \
  cp /tmp/aq/rules/*.md .qwen/rules/
```

## Confirm it loaded

1. `paths` must be a **YAML list**. A scalar (`paths: "**/*.ts"`) is rejected with
   `"paths" must be an array of glob patterns`.
2. Globs are matched with minimatch, so `**`, `*` and `{a,b}` brace sets all work.
3. Reload context with `/memory refresh`, or restart Qwen Code.
4. The debug log reports `Loaded N global rule(s)` and `Loaded N project rule(s)` — the quickest
   check that a file was picked up at all.
5. If a project rule never fires, check folder trust first: project-level `rules/` is skipped for
   untrusted folders, while `~/.qwen/rules/` is not.

A rule with no `paths:` key is a *baseline* rule and is injected into every session — use that only
for guidance that genuinely applies to every file.

## Update or remove

Rules are ordinary files, so updating is re-fetching and removing is `rm`:

```bash
rm .qwen/rules/jinja-llm-prompts.md      # uninstall one
rm -rf .qwen/rules                      # uninstall all project rules
```

Keep project rules committed so the whole team gets the same standards; move a rule to
`~/.qwen/rules/` instead if it is personal taste rather than a project convention.
