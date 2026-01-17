# Git Branching Strategy - TrackMyExpense

## Overview
We follow a **simplified Git Flow** strategy optimized for a solo developer with production deployment. This strategy balances simplicity with professional practices.

## Branch Structure

```
main (production)
  ↓
develop (staging/integration)
  ↓
feature/* (new features)
hotfix/* (urgent production fixes)
release/* (release preparation)
```

## Branch Types

### 1. `main` - Production Branch
- **Purpose**: Production-ready code only
- **Protection**: Protected branch, no direct commits
- **Deployment**: Auto-deploys to production (myexpenses.online)
- **Merges from**: `develop` (via PR) or `hotfix/*` branches
- **Naming**: `main`

**Rules:**
- Always stable and deployable
- Tagged with version numbers (v1.0.0, v1.1.0, etc.)
- Never commit directly to main
- All changes via Pull Request

### 2. `develop` - Development/Staging Branch
- **Purpose**: Integration branch for features
- **Protection**: Optional protection
- **Deployment**: Can deploy to staging environment
- **Merges from**: `feature/*` branches
- **Merges to**: `main` (via release)
- **Naming**: `develop`

**Rules:**
- Should be stable but can have minor issues
- All features merge here first
- Test thoroughly before merging to main

### 3. `feature/*` - Feature Branches
- **Purpose**: Develop new features or improvements
- **Created from**: `develop`
- **Merges to**: `develop`
- **Naming**: `feature/description-in-kebab-case`
- **Lifetime**: Short-lived (delete after merge)

**Examples:**
- `feature/profile-picture-upload`
- `feature/password-change`
- `feature/budget-management`
- `feature/transaction-filters`

**Rules:**
- One feature per branch
- Keep branches small and focused
- Merge frequently to avoid conflicts
- Delete after merging

### 4. `hotfix/*` - Hotfix Branches
- **Purpose**: Urgent production bug fixes
- **Created from**: `main`
- **Merges to**: `main` AND `develop`
- **Naming**: `hotfix/description-in-kebab-case`
- **Lifetime**: Very short-lived

**Examples:**
- `hotfix/login-error`
- `hotfix/transaction-delete-bug`
- `hotfix/cors-issue`

**Rules:**
- Only for critical production bugs
- Merge to both main and develop
- Tag with patch version (v1.0.1)
- Delete after merging

### 5. `release/*` - Release Branches (Optional)
- **Purpose**: Prepare for production release
- **Created from**: `develop`
- **Merges to**: `main` AND `develop`
- **Naming**: `release/v1.x.x`
- **Lifetime**: Short-lived

**Examples:**
- `release/v1.1.0`
- `release/v2.0.0`

**Rules:**
- Only version bumps and bug fixes
- No new features
- Merge to main when ready
- Tag with version number

## Workflow Examples

### Adding a New Feature

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/profile-settings

# 3. Work on feature (commit often)
git add .
git commit -m "feat: add profile picture upload"
git commit -m "feat: add password change dialog"

# 4. Push to remote
git push origin feature/profile-settings

# 5. Create Pull Request on GitHub
# develop ← feature/profile-settings

# 6. After PR approved and merged, delete branch
git checkout develop
git pull origin develop
git branch -d feature/profile-settings
git push origin --delete feature/profile-settings
```

### Releasing to Production

```bash
# 1. Ensure develop is stable
git checkout develop
git pull origin develop

# 2. Create release branch (optional)
git checkout -b release/v1.1.0

# 3. Update version numbers, changelog
# Edit package.json, CHANGELOG.md, etc.
git commit -m "chore: bump version to 1.1.0"

# 4. Create PR to main
# main ← release/v1.1.0

# 5. After merge, tag the release
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release v1.1.0 - Profile improvements"
git push origin v1.1.0

# 6. Merge back to develop
git checkout develop
git merge main
git push origin develop

# 7. Delete release branch
git branch -d release/v1.1.0
```

### Hotfix for Production Bug

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/login-error

# 2. Fix the bug
git add .
git commit -m "fix: resolve login authentication error"

# 3. Create PR to main
# main ← hotfix/login-error

# 4. After merge, tag with patch version
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix v1.0.1 - Login error"
git push origin v1.0.1

# 5. Merge to develop as well
git checkout develop
git merge main
git push origin develop

# 6. Delete hotfix branch
git branch -d hotfix/login-error
git push origin --delete hotfix/login-error
```

## Commit Message Convention

We follow **Conventional Commits** for clear history:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build, etc.)
- `ci`: CI/CD changes

### Examples
```bash
feat(auth): add profile picture upload
fix(transactions): resolve delete button error
docs(readme): update deployment instructions
chore(deps): upgrade react to v18.3.0
refactor(settings): extract password dialog to component
perf(dashboard): optimize transaction loading
```

## Version Numbering (SemVer)

We use **Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Examples
- `v1.0.0` - Initial production release
- `v1.1.0` - Added profile management features
- `v1.1.1` - Fixed profile picture upload bug
- `v2.0.0` - Major redesign with breaking API changes

## Branch Protection Rules

### For `main` branch:
1. Require pull request reviews (at least 1)
2. Require status checks to pass (CI/CD)
3. Require branches to be up to date
4. Do not allow force pushes
5. Do not allow deletions

### For `develop` branch:
1. Optional: Require pull request reviews
2. Require status checks to pass
3. Allow force pushes (with caution)

## Setting Up Branch Protection (GitHub)

```bash
# Go to GitHub repository
# Settings → Branches → Add rule

# For main:
Branch name pattern: main
☑ Require a pull request before merging
☑ Require status checks to pass before merging
☑ Require branches to be up to date before merging
☑ Do not allow bypassing the above settings
☐ Allow force pushes
☐ Allow deletions

# For develop:
Branch name pattern: develop
☑ Require status checks to pass before merging
☐ Require a pull request before merging (optional)
```

## Current State Migration

Since you've been pushing directly to `main`, here's how to migrate:

```bash
# 1. Create develop branch from current main
git checkout main
git pull origin main
git checkout -b develop
git push origin develop

# 2. Set develop as default branch on GitHub
# Settings → Branches → Default branch → develop

# 3. From now on, work on feature branches
git checkout develop
git checkout -b feature/your-next-feature

# 4. Your current changes (profile improvements)
# Can be committed to a feature branch and merged via PR
```

## Quick Reference

### Daily Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Work and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
# Create PR on GitHub: develop ← feature/my-feature
```

### Deploy to Production
```bash
# Create PR: main ← develop
# After merge:
git checkout main
git pull origin main
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x
```

### Emergency Hotfix
```bash
git checkout main
git checkout -b hotfix/critical-bug
# Fix bug
git commit -m "fix: critical bug"
# Create PR: main ← hotfix/critical-bug
# After merge, also merge to develop
```

## Tools & Automation

### Recommended GitHub Actions
1. **CI/CD Pipeline**: Run tests on PR
2. **Auto-deploy**: Deploy to production on main merge
3. **Version Bump**: Auto-increment version on release
4. **Changelog**: Auto-generate from commits

### Git Aliases (Optional)
Add to `~/.gitconfig`:
```ini
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    feature = checkout -b feature/
    hotfix = checkout -b hotfix/
    release = checkout -b release/
```

## Best Practices

1. **Commit Often**: Small, focused commits
2. **Pull Frequently**: Stay up to date with develop
3. **Write Good Messages**: Follow conventional commits
4. **Review Your Own PRs**: Check diff before requesting review
5. **Delete Merged Branches**: Keep repository clean
6. **Tag Releases**: Always tag production releases
7. **Update Changelog**: Document changes for each release
8. **Test Before Merge**: Ensure features work before merging

## Troubleshooting

### Merge Conflicts
```bash
# Update your branch with latest develop
git checkout feature/my-feature
git fetch origin
git merge origin/develop
# Resolve conflicts
git add .
git commit -m "chore: resolve merge conflicts"
```

### Accidentally Committed to Wrong Branch
```bash
# Move commits to new branch
git branch feature/my-feature
git reset --hard origin/develop
git checkout feature/my-feature
```

### Need to Update PR After Review
```bash
git checkout feature/my-feature
# Make changes
git add .
git commit -m "fix: address PR feedback"
git push origin feature/my-feature
# PR updates automatically
```

## Summary

- **main**: Production only, protected, tagged
- **develop**: Integration branch, default for development
- **feature/***: New features, merge to develop
- **hotfix/***: Urgent fixes, merge to main and develop
- **Commit messages**: Use conventional commits
- **Versions**: Follow semantic versioning
- **PRs**: Always use pull requests for main

This strategy keeps your code organized, makes collaboration easier, and provides a clear history of changes.
