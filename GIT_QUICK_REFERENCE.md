# Git Quick Reference - TrackMyExpense

## 🌳 Branch Structure

```
main (production) → develop (staging) → feature/* (development)
```

## 🚀 Common Workflows

### Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
```

### Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### Create Pull Request
1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Base: `develop` ← Compare: `feature/my-feature`
4. Fill in PR template
5. Request review (or merge if solo)

### After PR Merged
```bash
git checkout develop
git pull origin develop
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Deploy to Production
```bash
# Create PR: main ← develop
# After merge:
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

### Emergency Hotfix
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
# Fix bug
git add .
git commit -m "fix: critical bug"
git push origin hotfix/critical-bug
# Create PR: main ← hotfix/critical-bug
# After merge to main, also merge to develop
```

## 📝 Commit Message Format

```
<type>(<scope>): <subject>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance

### Examples
```bash
feat(auth): add profile picture upload
fix(transactions): resolve delete button error
docs(readme): update deployment instructions
chore(deps): upgrade react to v18.3.0
```

## 🏷️ Version Tags

```bash
# Create tag
git tag -a v1.1.0 -m "Release v1.1.0 - Profile improvements"
git push origin v1.1.0

# List tags
git tag -l

# Delete tag
git tag -d v1.1.0
git push origin --delete v1.1.0
```

## 🔧 Useful Commands

### Check Status
```bash
git status
git branch
git log --oneline --graph --all
```

### Update Branch
```bash
git fetch origin
git merge origin/develop
# or
git pull origin develop
```

### Undo Changes
```bash
# Undo uncommitted changes
git checkout -- <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Resolve Conflicts
```bash
git merge origin/develop
# Fix conflicts in files
git add .
git commit -m "chore: resolve merge conflicts"
```

### Stash Changes
```bash
# Save changes temporarily
git stash

# List stashes
git stash list

# Apply stash
git stash pop
```

## 🎯 Daily Workflow

### Morning
```bash
git checkout develop
git pull origin develop
git checkout -b feature/todays-work
```

### During Day
```bash
# Commit often
git add .
git commit -m "feat: implement X"
git commit -m "fix: resolve Y"
```

### End of Day
```bash
git push origin feature/todays-work
# Create PR if feature is complete
```

## 🚨 Emergency Commands

### Accidentally Committed to Wrong Branch
```bash
git branch feature/my-feature
git reset --hard origin/develop
git checkout feature/my-feature
```

### Need to Discard All Changes
```bash
git reset --hard HEAD
git clean -fd
```

### Forgot to Create Feature Branch
```bash
# If not pushed yet
git branch feature/my-feature
git reset --hard origin/develop
git checkout feature/my-feature
```

## 📚 Resources

- Full strategy: `BRANCHING_STRATEGY.md`
- Changelog: `CHANGELOG.md`
- Setup script: `setup-branches.ps1` or `setup-branches.sh`

## 🎓 Best Practices

1. ✅ Always work on feature branches
2. ✅ Commit often with clear messages
3. ✅ Pull before starting new work
4. ✅ Create PRs for code review
5. ✅ Delete branches after merge
6. ✅ Tag production releases
7. ✅ Update CHANGELOG.md
8. ✅ Test before merging

## 🆘 Need Help?

```bash
# Git help
git help <command>

# Show commit history
git log --oneline --graph --all --decorate

# Show changes
git diff
git diff --staged

# Show branch info
git branch -vv
```
