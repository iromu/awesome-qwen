---
name: git-workflows
description: >
  Set up git branching strategies, resolve merge conflicts, configure PR workflows,
  implement feature branch or gitflow workflows, manage release and hotfix branches,
  or need conventions for team collaboration. Use this skill when the user mentions
  "branch strategy", "merge conflict", "pull request workflow", "gitflow", "trunk-based
  development", "release management", "hotfix process", "rebase vs merge", "feature
  flag workflow", or "team git conventions". Don't hesitate to suggest this skill when
  the user is setting up a new repo, onboarding to a team, or dealing with messy git history.
version: 1.0.0
category: development
tags: [git, branching, merge-conflicts, pr-workflows, gitflow, trunk-based, collaboration]
---

# Git Workflows

Define and enforce branching strategies, resolve merge conflicts, and manage pull request
workflows for team collaboration. This skill covers **branching models**, **conflict
resolution**, and **PR/process conventions** — not commit message formatting (use the
`git-commit` skill for that).

## When to Use

- Setting up a new project's Git workflow or branching model
- Resolving merge conflicts between branches
- Configuring pull request review workflows and required checks
- Implementing Gitflow, GitHub Flow, or trunk-based development
- Managing release branches and production hotfixes
- Enforcing branch protection rules and CI gates
- Teaching a team member how to rebase, merge, or handle conflicts
- Cleaning up messy git history before a PR or merge
- Deciding between rebase and merge strategies for integrating changes

## Procedure

### Step 1: Choose a Branching Strategy

Select the model that fits the team's size, release cadence, and risk tolerance.

**Feature Branch Workflow** (simple, small teams)
```
main ────────────────────────────────────────►
  ├─ feature/a ──────────┐
  ├─ feature/b ───────┐  │
  └─ feature/c ─────────┴─┘
```
```bash
git checkout main && git pull origin main
git checkout -b feature/add-login
# ... develop ...
git push -u origin feature/add-login
# Create PR on GitHub/GitLab/Bitbucket
```

**Gitflow** (structured releases, larger teams)
```
main ────────────────────────────────────────►
  │                              ▲
  └── develop ───────────────────┘
      ├─ feature/auth ──────┐
      ├─ feature/search ────┤
      │                      ▼
      release/1.0 ────────────► main + tag v1.0
      │                              ▲
      └─ hotfix/urgent ──────────────┘
```

**Trunk-Based Development** (CI-heavy, fast iteration)
```
main ────────────────────────────────────────►
  └─ short-lived feature ────────────────────►
```
Key: short-lived feature branches (≤1 day), frequent merges to main, feature flags for incomplete work.

### Step 2: Branch Naming Convention

Adopt a consistent naming scheme:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/user-profile` |
| `bugfix/` | Non-urgent bug fix | `bugfix/null-pointer` |
| `hotfix/` | Urgent production fix | `hotfix/payment-timeout` |
| `release/` | Release preparation | `release/2.1.0` |
| `chore/` | Maintenance tasks | `chore/update-deps` |
| `docs/` | Documentation only | `docs/api-reference` |
| `test/` | Test additions | `test/integration-api` |

### Step 3: Resolving Merge Conflicts

**Rebase approach** (keeps linear history):
```bash
# Fetch latest
git fetch origin

# Rebase feature onto latest main
git checkout feature/add-login
git rebase origin/main

# If conflicts arise, Git stops at the conflicting commit:
# 1. Open the conflicted files — look for <<<<<<< markers
# 2. Edit files to resolve conflicts
# 3. Stage resolved files
git add <resolved-files>
# 4. Continue the rebase
git rebase --continue

# If the rebase goes wrong, abort and start over
git rebase --abort
```

**Merge approach** (preserves full history):
```bash
git checkout main
git pull origin main
git merge feature/add-login

# If conflicts arise:
# 1. Edit conflicted files
# 2. Stage resolved files
git add <resolved-files>
# 3. Complete the merge
git commit -m "merge: resolve conflicts in feature/add-login"
```

**Best practice:** Rebase locally, merge on the remote (via PR UI).

### Step 4: Pull Request Workflow

Standard PR process:

```bash
# 1. Push the feature branch
git push -u origin feature/add-login

# 2. Create PR (GitHub CLI example)
gh pr create \
  --base main \
  --head feature/add-login \
  --title "feat: add user login" \
  --body "Closes #42"

# 3. After approval and CI passes, merge
gh pr merge 123 --squash --delete-branch
```

**PR checklist:**
- [ ] Branch is up to date with `main` (rebased/merged)
- [ ] CI checks pass
- [ ] At least one reviewer approved
- [ ] Changes documented (if user-facing)
- [ ] No merge conflicts

### Step 5: Release and Hotfix Management

**Release branch:**
```bash
# Cut release branch from develop/main
git checkout develop
git pull origin develop
git checkout -b release/2.1.0

# Fix release-specific issues
git commit -m "fix: bump version to 2.1.0"

# Merge to main and tag
git checkout main
git merge release/2.1.0
git tag -a v2.1.0 -m "Release 2.1.0"
git push origin main --tags
```

**Hotfix (urgent production fix):**
```bash
# Branch from main (not develop)
git checkout main
git pull origin main
git checkout -b hotfix/payment-timeout

# Fix and push
git commit -m "fix(payment): handle timeout in payment gateway"
git push -u origin hotfix/payment-timeout

# PR to main (and optionally merge back to develop)
gh pr create --base main --head hotfix/payment-timeout
git checkout develop
git merge hotfix/payment-timeout
```

### Step 6: Clean Up

After merging, delete the feature branch locally and remotely:
```bash
# Delete remote branch
git push origin --delete feature/add-login

# Delete local tracking reference
git branch -d feature/add-login
```

Clean up stale tracking references:
```bash
git fetch origin --prune
```

## Pitfalls

- ❌ Never force-push to shared branches (`main`, `develop`, release branches)
- ⚠️ `git rebase` rewrites history — only on local, unshared branches
- ⚠️ Large PRs (>400 lines) are hard to review — split into smaller feature branches
- ⚠️ Don't merge `main` into feature branches frequently — rebase onto `main` instead (fewer conflicts)
- ❌ Don't leave stale branches lying around — delete after merge
- ⚠️ Always pull/rebase before creating a PR to avoid last-minute conflicts
- ❌ Never commit secrets, API keys, or credentials — use `.gitignore` and pre-commit hooks

## When NOT to Use This Skill

| Situation | Better Alternative |
|-----------|-------------------|
| Writing commit messages or formatting them | Use the `git-commit` skill instead |
| Using GitHub Flow with no release branches | Simplify — just use `main` + feature branches |
| Working in a solo project with no collaborators | Simple `main` branch is sufficient; no workflow needed |
| Need to audit commit history or find a bug's origin | Use `git log`, `git blame`, or `git bisect` (not a workflow) |
| Using a managed platform (GitLab SaaS, GitHub Enterprise) with enforced policies | Follow the platform's built-in workflows and branch protection rules |

## Verification

- [ ] Branch naming convention is documented and followed
- [ ] Merge conflicts are resolved via rebase (local) or merge (PR)
- [ ] PRs are small, focused, and up to date with `main`
- [ ] CI checks pass before merge
- [ ] Release and hotfix branches merge back to `main` and (optionally) `develop`
- [ ] Stale branches are cleaned up after merge

## References

- Git branching models: https://nvie.com/posts/a-successful-git-branching-model/
- Atlassian Git tutorials: https://www.atlassian.com/git/tutorials
- GitHub Flow: https://docs.github.com/en/get-started/using-github/github-flow
- Conventional Commits (commit messages): https://www.conventionalcommits.org/ (see also `git-commit` skill)
