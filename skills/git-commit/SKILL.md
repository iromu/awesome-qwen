---
name: git-commit
description: Generate, improve, and format Git commit messages following the Conventional Commits specification. Use this skill whenever the user asks to create, write, or generate a commit message — including phrases like "commit these changes", "help me commit", "make a commit", "git commit", "write a commit", "what should I call this commit", or "amend commit". Also trigger for: improving or rewriting an existing commit message, formatting a commit message, choosing a conventional commit type (feat, fix, docs, style, refactor, test, chore, ci, build, perf, revert), defining a scope, writing a commit body or footer (BREAKING CHANGE, Closes #N, Signed-off-by, Reverts), handling squash/reword/fixup/amend commits, working with commitizen or commitlint, and any question about commit conventions, styles, formats, or best practices.
version: 1.0.0
category: development
tags: ["git", "commits", "conventional-commits", "commit-messages", "commitizen", "commitlint", "amend", "squash", "reword", "fixup"]
---

# Git Commit Messages

Generate, improve, and format Git commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## When to Use

- The user asks to create, write, or generate a commit message
- The user says "commit these changes", "help me commit", "make a commit", "git commit", "write a commit", "what should I call this commit", "amend commit", or "reword commit"
- The user wants to improve, rewrite, or format an existing commit message
- The user provides staged changes (via `git diff --staged`) and needs a commit message
- The user asks about conventional commit types, scopes, or formatting
- The user wants help writing a commit body or footer (BREAKING CHANGE, Closes #N, Signed-off-by, Reverts)
- The user needs help with squash, reword, fixup, or amend operations
- The user references commitizen, commitlint, or other commit tooling
- The user asks about commit conventions, styles, formats, or best practices
- The user wants to enforce or validate commit message format

## Common Trigger Phrases

If the user's message contains any of these, this skill applies:

| Phrase | Intent |
|--------|--------|
| "commit these changes" | Generate a commit message from staged/unstaged diff |
| "help me commit" | Generate or improve a commit message |
| "make a commit" / "git commit" | Generate a commit message |
| "what should I call this commit" | Generate a commit message |
| "amend the commit" / "amend commit message" | Rewrite the last commit message |
| "reword the commit" | Rewrite the last commit message |
| "improve my commit message" | Improve an existing commit message |
| "fix the commit format" | Fix formatting to match a convention |
| "squash these commits" | Help with squash commit messaging |
| "commitizen" / "commitlint" | Work with commit tooling |
| "conventional commit" | Use Conventional Commits format |
| "feat / fix / docs / refactor" | Use a specific commit type |
| "BREAKING CHANGE" | Add breaking change notation |
| "Signed-off-by" | Add DCO footer |
| "Closes #123" | Add issue reference footer |

## Procedure

### Step 1: Gather Context

If the user provides a diff, use it directly. Otherwise, run:

```bash
git diff --staged
```

If nothing is staged, ask the user whether they want to stage changes first or provide the diff manually.

Also gather:
```bash
git log -n 5 --oneline
git status
```

This gives you recent commit history for style consistency and current file state.

### Step 2: Analyze Changes

Read the diff and categorize the changes:

1. **Type** — what kind of change is this?
   - `feat` — a new feature
   - `fix` — a bug fix
   - `docs` — documentation-only changes
   - `style` — code style changes (formatting, semicolons, etc. — no code change)
   - `refactor` — code refactoring (no feature, no bug fix)
   - `test` — adding or correcting tests
   - `chore` — maintenance tasks, dependencies, config
   - `ci` — CI/CD configuration changes
   - `build` — build system or dependency changes
   - `perf` — performance improvements
   - `revert` — reverting a previous commit

2. **Scope** — what part of the codebase is affected? (optional, use a short identifier)
   - Use module names, file names, or domain terms: `auth`, `api`, `ui`, `db`, `config`
   - Omit scope if the change is too broad or touches many areas

3. **Description** — a concise summary in the imperative mood
   - Use present tense: "add" not "added" or "adds"
   - No capitalization at start: "add feature" not "Add feature"
   - No period at end
   - Be specific but brief: "add user login endpoint" not "added the endpoint for logging in users"

### Step 3: Write the Commit Message

**Subject line (required):**
```
type(scope): description
```

Examples:
```
feat(auth): add JWT token refresh endpoint
fix(ui): resolve table overflow on mobile screens
docs(api): update OpenAPI spec for v2 endpoints
refactor(db): extract query builder into separate module
```

If no scope is appropriate:
```
feat: add user profile avatar upload
fix: handle null pointer in payment processing
```

**Body (optional, add when the "why" isn't obvious from the diff):**
- Explain the motivation for the change
- Contrast with previous behavior
- Keep lines under 72 characters

**Footer (optional, add when applicable):**
- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Closes #123`, `Refs #456`
- Related commits: `Reverts abc1234`

**Full example:**
```
feat(auth): add JWT token refresh endpoint

Add a /auth/refresh endpoint that accepts a valid refresh token
and returns a new access token. Refresh tokens expire after 7 days
and are rotated on each use.

Closes #234
```

### Step 4: Provide Options

Present the commit message to the user. If multiple interpretations are possible, offer 2-3 variants with different scopes or emphases.

Format your response like this:

```
Here are a few options:

**Option 1 (recommended):**
```
feat(auth): add JWT token refresh endpoint

Add a /auth/refresh endpoint that accepts a valid refresh token
and returns a new access token.
```

**Option 2:**
```
feat(api): implement token refresh flow

New endpoint for rotating refresh tokens and issuing fresh access tokens.
```
```

### Step 5: Improve Existing Messages (if requested)

If the user provides an existing commit message to improve:
1. Analyze the original for format, clarity, and convention compliance
2. Rewrite following the rules above
3. Explain what you changed and why

Example transformation:
```
Original: "Fixed the bug where users couldn't log in"
Improved: fix(auth): resolve login failure when session expired

The previous error message was misleading and didn't indicate
whether the issue was credentials or session expiry.
```

## Pitfalls

- ❌ Don't use past tense ("added", "fixed") — use imperative ("add", "fix")
- ❌ Don't capitalize the first letter of the subject line
- ❌ Don't end the subject line with a period
- ❌ Don't be vague: "update code" tells nothing
- ❌ Don't include files that should be in `.gitignore`
- ⚠️ Keep the subject line under 50 characters when possible
- ⚠️ The body should explain *why*, not restate *what* (the diff shows what)
- ⚠️ Use scope consistently within a project — pick a convention and stick with it

## Verification Checklist

Before finalizing a commit message, verify:
- [ ] Subject line under 50-72 characters
- [ ] Imperative mood, present tense
- [ ] No capital letter at start of subject
- [ ] No period at end of subject
- [ ] Type is appropriate for the change
- [ ] Scope is meaningful (or omitted if too broad)
- [ ] Body explains motivation, not mechanics
- [ ] Footer includes breaking changes or references if applicable

## Quick Reference

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Tests |
| `chore` | Maintenance, config |
| `ci` | CI/CD changes |
| `build` | Build system, deps |
| `perf` | Performance |
| `revert` | Revert |

### Footer Keywords

| Keyword | Purpose |
|---------|---------|
| `BREAKING CHANGE:` | API/behavior change |
| `Closes #N` | Auto-close issue on merge |
| `Refs #N` | Reference issue |
| `Reverts <hash>` | Revert previous commit |
| `Signed-off-by:` | DCO sign-off |
