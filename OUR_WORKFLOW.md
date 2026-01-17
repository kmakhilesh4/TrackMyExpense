# Our Git Workflow - Quick Reference

## 🎯 Current Setup

- **main** - Production branch (protected, deployed to myexpenses.online)
- **develop** - Development branch (default, where features merge)
- **feature/** - Feature branches (created for each new feature/change)

## 📋 Workflow Rules

### When You Ask for Changes

I will tell you:

1. **Create a new feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/descriptive-name
   ```

2. **Work on the feature** (I'll make the changes)

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/descriptive-name
   ```

4. **When to merge to develop**
   - After feature is complete and tested
   - Create PR: `develop` ← `feature/descriptive-name`
   - Or merge directly if you prefer

5. **When to merge to main (production)**
   - When you want to deploy to production
   - After testing on develop
   - Create PR: `main` ← `develop`
   - Tag with version number

6. **When to create release branch**
   - When preparing for production deployment
   - Multiple features ready to go live
   - Need to do final testing/fixes before production

## 🔄 Typical Flow

### Small Change (Quick Fix)
```
develop → feature/fix-something → develop → main
```

### New Feature
```
develop → feature/new-feature → develop → (test) → main
```

### Multiple Features for Release
```
develop → feature/feature-1 → develop
develop → feature/feature-2 → develop
develop → feature/feature-3 → develop
develop → release/v1.2.0 → main (tag v1.2.0)
```

### Emergency Production Fix
```
main → hotfix/critical-bug → main (tag v1.1.1) → develop
```

## 📝 My Guidance Format

When you ask for changes, I'll say:

```
🌿 BRANCH: Create feature/your-feature-name from develop

[I make the changes]

✅ COMMIT: 
git add .
git commit -m "feat: description"
git push origin feature/your-feature-name

🔀 MERGE: 
- Test the feature
- Merge to develop when ready
- Deploy to production when stable

📦 RELEASE: 
- Not needed for this change (or)
- Create release/v1.x.x when ready to deploy
```

## 🎯 Decision Matrix

### Create Feature Branch When:
- ✅ Adding new feature
- ✅ Fixing bug
- ✅ Updating documentation
- ✅ Refactoring code
- ✅ ANY change to the codebase

### Merge to Develop When:
- ✅ Feature is complete
- ✅ Code is tested locally
- ✅ No breaking changes
- ✅ Ready for integration testing

### Create Release Branch When:
- ✅ Multiple features ready for production
- ✅ Need version bump and changelog update
- ✅ Want to freeze features for testing
- ✅ Preparing for major/minor release

### Merge to Main When:
- ✅ Ready to deploy to production
- ✅ All features tested on develop
- ✅ Release branch tested (if used)
- ✅ Changelog updated
- ✅ Version number ready

### Create Hotfix Branch When:
- ✅ Critical bug in production
- ✅ Can't wait for normal release cycle
- ✅ Need immediate fix

## 📊 Version Numbering

- **Major (v2.0.0)**: Breaking changes, major redesign
- **Minor (v1.1.0)**: New features, backward compatible
- **Patch (v1.0.1)**: Bug fixes only

## 🚀 Example Scenarios

### Scenario 1: You ask "Add export to CSV feature"
```
🌿 BRANCH: feature/export-csv
✅ COMMIT: "feat: add CSV export functionality"
🔀 MERGE: To develop after testing
📦 RELEASE: Include in next minor release (v1.2.0)
```

### Scenario 2: You ask "Fix login button color"
```
🌿 BRANCH: feature/fix-login-button
✅ COMMIT: "fix: correct login button color"
🔀 MERGE: To develop immediately
📦 RELEASE: Can deploy directly or wait for next release
```

### Scenario 3: You ask "Update README"
```
🌿 BRANCH: docs/update-readme
✅ COMMIT: "docs: update installation instructions"
🔀 MERGE: To develop immediately
📦 RELEASE: Not critical, include in next release
```

### Scenario 4: You say "Production is broken!"
```
🌿 BRANCH: hotfix/critical-bug
✅ COMMIT: "fix: resolve critical production bug"
🔀 MERGE: To main immediately, then to develop
📦 RELEASE: Tag as patch version (v1.0.1)
```

### Scenario 5: You say "Ready to deploy everything"
```
🌿 BRANCH: release/v1.2.0
✅ COMMIT: "chore: prepare release v1.2.0"
🔀 MERGE: To main after final testing
📦 RELEASE: Tag as v1.2.0
```

## 💡 Quick Tips

1. **Always start from develop** for new features
2. **Use descriptive branch names** (feature/add-dark-mode)
3. **Test before merging** to develop
4. **Update CHANGELOG.md** before releasing
5. **Tag releases** on main branch
6. **Delete feature branches** after merging

## 🎓 What I'll Tell You

For every change request, I'll provide:

1. ✅ Branch name to create
2. ✅ Commit message to use
3. ✅ When to merge to develop
4. ✅ When to merge to main
5. ✅ Whether to create release branch
6. ✅ Version number if releasing

## 📞 Questions to Ask Me

- "Should I merge this to develop now?"
- "Is this ready for production?"
- "Should I create a release branch?"
- "What version number should this be?"
- "Can I deploy this directly?"

I'll always give you clear guidance!

---

**Current Version:** v1.1.0 (unreleased)  
**Next Release:** When profile features are deployed  
**Default Branch:** develop  
**Production Branch:** main
