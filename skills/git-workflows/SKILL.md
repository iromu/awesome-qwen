---
name: git-workflows
description: Git branching strategies, commit conventions, and collaboration workflows
version: 1.0.0
category: development
tags: ["git", "branching", "commits", "collaboration"]
---

# Git Workflows

## When to Use
- Setting up a new project's Git workflow
- Resolving merge conflicts
- Creating conventional commit messages
- Managing release branches and hotfixes

## Procedure

### 1. Commit Message Convention (Conventional Commits)
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`

**Examples**:
```
feat(auth): add JWT token refresh endpoint
fix(ui): resolve table overflow on mobile screens
docs(api): update OpenAPI spec for v2 endpoints
refactor(db): extract query builder into separate module
```

### 2. Branch Naming
```
feature/<description>     # New features
bugfix/<issue-id>         # Bug fixes
hotfix/<description>      # Urgent production fixes
release/<version>         # Release preparation
```

### 3. Feature Branch Workflow
```bash
# Create feature branch from main
git checkout main && git pull
git checkout -b feature/add-user-auth

# Develop, commit conventionally
git add .
git commit -m "feat(auth): implement user login endpoint"

# Push and create PR
git push -u origin feature/add-user-auth
```

### 4. Resolving Merge Conflicts
```bash
# Fetch latest
git fetch origin

# Rebase onto main
git rebase origin/main

# On conflict, Git stops. Fix files, then:
git add <fixed-files>
git rebase --continue

# If things go wrong:
git rebase --abort
```

### 5. Squash and Merge (for clean history)
```bash
# Interactive rebase to squash commits
git rebase -i HEAD~3
# Change 'pick' to 'squash' for commits to combine
```

## Pitfalls
- ❌ Don't force-push to shared branches (`main`, `develop`, release branches)
- ⚠️ `git rebase` rewrites history - only on local branches
- ❌ Don't commit generated files (build artifacts, node_modules, .log)
- ⚠️ Large PRs (>400 lines) are hard to review - break into smaller PRs
- ❌ Never commit secrets, API keys, or credentials

## Verification
- [ ] Commit messages follow conventional format
- [ ] Branch names describe the work
- [ ] No merge conflicts before PR creation
- [ ] CI passes on the feature branch
- [ ] PR description explains the "why", not just the "what"

## References
- Conventional Commits: https://www.conventionalcommits.org/
- Git rebase vs merge: https://www.atlassian.com/git/tutorials/merging-vs-rebasing
