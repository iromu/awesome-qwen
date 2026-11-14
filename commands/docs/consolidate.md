---
description: Consolidate a project's planning trees into docs/, refresh README + AGENTS.md, then purge the planning trees
---

Consolidate this project's design documentation into the canonical `docs/` pages, update `README.md` and
`AGENTS.md` to point there, and purge the retired planning trees.

**Defaults** (override with the argument below — e.g. a different docs dir, different entry docs, or extra
paths to purge): {{args}}

| Role | Default path |
| --- | --- |
| Consolidation target | `docs/` |
| Entry docs to update | `README.md`, `AGENTS.md` |
| Trees to purge | `openspec/changes/`, `openspec/specs/` |

This is a documentation migration, not a code change: do not touch `src/`, build files, or tests.

## 1. Survey (read-only, before writing anything)

1. `git status --short` — note pre-existing changes; never fold unrelated work into this, and never revert
   or overwrite someone else's edits.
2. List every file under the purge paths and under `docs/`. Read the planning files (proposals, designs,
   specs, tasks) — they are the source material.
3. Read the current `docs/` pages, `README.md`, and `AGENTS.md` so the new pages slot into the existing
   structure and voice instead of duplicating it.

## 2. Plan the mapping, then get it approved

Produce a table: **each** source planning file → the `docs/` page that will carry its content, marked
`absorb`, `merge into existing section`, `refresh from code`, or `drop as stale` (with the reason).

- Consolidate by **topic**, not by change: one page per durable concern (architecture, the shared
  component/provider contract, quality-and-testing, dependency management, backlog).
- Collapse boilerplate that a per-component spec repeats N times into **one shared contract plus a
  per-component delta table**.
- Where a spec disagrees with the code, **the code is authoritative** — verify against the source and record
  the divergence rather than copying the stale claim.
- Anything **not yet implemented** must survive in a backlog page (blocked items included, with the reason
  each is blocked). Nothing may be lost by the purge; if a file has no home, either give it one or say so
  explicitly before proceeding.

Show the table and wait for approval before any deletion.

## 3. Write the docs pages

Create/rewrite the `docs/` pages from the approved mapping. Prose over boilerplate: state the invariant and
the why, link to the key files rather than restating them, and keep each page's claims verifiable against
the current tree. Follow the repo's existing doc conventions (heading style, links, language).

## 4. Update the entry docs

- `README.md`: a Documentation section (or table) indexing every `docs/` page with a one-line summary of its
  contents; remove any pointer into the purged trees.
- `AGENTS.md`: point the "read first" list and the key-files list at the `docs/` pages, and record that the
  planning trees are retired so no future agent goes looking for them.
- Then hunt for dangling references to the purged paths across the repo (READMEs, `CONTRIBUTING.md`,
  `Makefile`, CI workflows, `.gitignore`, config files, skills/wiki) and fix each one.

## 5. Purge — only after step 2 is approved and step 3 verifies

1. Spot-check that each absorbed file's substance is actually present in its `docs/` page.
2. Delete with `git rm -r` (never `rm -rf`) so the deletion stays reversible.
3. Keep any scaffolding the project still uses — config files, CLI install steps, lockfile/skill entries —
   unless the argument above says otherwise. If re-creating a planning change remains a valid workflow,
   leave a note saying so in the backlog page.

## 6. Report

Summarize: pages created/changed, what was dropped as stale and why, what remains behind, and the result of
the dangling-reference check. Do not commit or push unless asked.
