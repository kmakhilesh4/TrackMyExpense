# Migrate to Branching Strategy - Step by Step

## Current Situation
You've been pushing directly to `main` branch. Let's migrate to a proper branching strategy.

## Migration Steps

### Option 1: Automated Setup (Recommended)

**For Windows (PowerShell):**
```powershell
.\setup-branches.ps1
```

**For Linux/Mac (Bash):**
```bash
chmod +x setup-branches.sh
./setup-branches.sh
```

This script will:
1. Create `develop` branch from `main`
2. Create `feature/profile-improvements` branch
3. Set you up to commit your current changes

### Option 2: Manual Setup

#### Step 1: Create Develop Branch
```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

#### Step 2: Set Develop as Default Branch (GitHub)
1. Go to your GitHub repository
2. Click "Settings" → "Branches"
3. Under "Default branch", click the switch icon
4. Select `develop`
5. Click "Update"

#### Step 3: Create Feature Branch for Current Work
```bash
# Create feature branch from develop
git checkout develop
git checkout -b feature/profile-improvements
```

#### Step 4: Commit Your Current Changes
```bash
# Check what's changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: add profile management features

- Add profile picture upload with S3 integration
- Add password change functionality
- Add profile editing (name)
- Hide budget feature from UI
- Extend session to 8 hours
- Add avatar click navigation to settings
- Update infrastructure templates
- Add branching strategy documentation"

# Push to remote
git push -u origin feature/profile-improvements
```

#### Step 5: Create Pull Request
1. Go to GitHub repository
2. You'll see a banner "Compare & pull request" - click it
3. Or click "Pull requests" → "New pull request"
4. Set base: `develop` ← compare: `feature/profile-improvements`
5. Fill in the PR template:
   - Title: "feat: Add profile management features"
   - Description: Describe the changes
   - Check the boxes in the checklist
6. Click "Create pull request"

#### Step 6: Review and Merge PR
Since you're solo developer:
1. Review your own changes (good practice!)
2. Click "Merge pull request"
3. Click "Confirm merge"
4. Click "Delete branch" (cleanup)

#### Step 7: Update Local Develop
```bash
git checkout develop
git pull origin develop
```

#### Step 8: Prepare for Production Release
```bash
# Create release branch (optional but recommended)
git checkout -b release/v1.1.0

# Update version in package.json files
# Update CHANGELOG.md

git add .
git commit -m "chore: prepare release v1.1.0"
git push -u origin release/v1.1.0
```

#### Step 9: Create PR to Main
1. Create PR: `main` ← `release/v1.1.0`
2. Review and merge
3. Delete release branch

#### Step 10: Tag the Release
```bash
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release v1.1.0 - Profile Management Features"
git push origin v1.1.0
```

#### Step 11: Merge Back to Develop
```bash
git checkout develop
git merge main
git push origin develop
```

## Protect Your Branches (GitHub)

### Protect Main Branch
1. Go to Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Check:
   - ☑ Require a pull request before merging
   - ☑ Require status checks to pass before merging
   - ☑ Do not allow bypassing the above settings
5. Click "Create"

### Protect Develop Branch (Optional)
1. Same steps as above
2. Branch name pattern: `develop`
3. Less strict rules (optional PR requirement)

## Your New Workflow

### Starting New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature
```

### Working on Feature
```bash
# Make changes
git add .
git commit -m "feat: implement something"
git push origin feature/my-new-feature
```

### Finishing Feature
```bash
# Create PR on GitHub: develop ← feature/my-new-feature
# After merge:
git checkout develop
git pull origin develop
git branch -d feature/my-new-feature
```

### Deploying to Production
```bash
# Create PR on GitHub: main ← develop
# After merge:
git checkout main
git pull origin main
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# Sync back to develop
git checkout develop
git merge main
git push origin develop
```

## Verification Checklist

After migration, verify:

- [ ] `develop` branch exists and is pushed to GitHub
- [ ] `develop` is set as default branch on GitHub
- [ ] Your current changes are on `feature/profile-improvements`
- [ ] Feature branch is pushed to GitHub
- [ ] PR is created: `develop` ← `feature/profile-improvements`
- [ ] Branch protection rules are set for `main`
- [ ] You understand the new workflow

## Rollback (If Needed)

If something goes wrong:

```bash
# Go back to main
git checkout main

# Delete branches if needed
git branch -D develop
git branch -D feature/profile-improvements

# Start over
```

## Common Questions

### Q: What if I already have uncommitted changes?
```bash
# Stash them first
git stash

# Follow migration steps

# Apply stash back
git stash pop
```

### Q: What if I have unpushed commits on main?
```bash
# Push them first
git checkout main
git push origin main

# Then follow migration steps
```

### Q: Can I still push to main in emergencies?
No, that's what hotfix branches are for:
```bash
git checkout main
git checkout -b hotfix/emergency-fix
# Fix and create PR
```

### Q: Do I need to create PRs if I'm working alone?
Yes! Benefits:
- Code review practice
- Clear history
- CI/CD integration
- Professional workflow
- Easy rollback

## Next Steps

1. ✅ Run setup script or follow manual steps
2. ✅ Commit current changes to feature branch
3. ✅ Create and merge PR to develop
4. ✅ Set up branch protection rules
5. ✅ Read `BRANCHING_STRATEGY.md` for full details
6. ✅ Keep `GIT_QUICK_REFERENCE.md` handy
7. ✅ Update `CHANGELOG.md` for each release

## Resources

- **Full Strategy**: `BRANCHING_STRATEGY.md`
- **Quick Reference**: `GIT_QUICK_REFERENCE.md`
- **Changelog**: `CHANGELOG.md`
- **PR Template**: `.github/pull_request_template.md`

Good luck with your new workflow! 🚀
