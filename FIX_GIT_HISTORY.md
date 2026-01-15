# Fix Git History - Remove Credentials

## Problem
The credentials are in an old commit (790591a1) that's still in git history.

## Solution: Rewrite Git History

### Option 1: Interactive Rebase (Recommended)

```bash
# Find the commit before the one with credentials
git log --oneline -10

# Start interactive rebase (replace COMMIT_BEFORE with the commit hash before 790591a1)
git rebase -i COMMIT_BEFORE

# In the editor that opens:
# - Change 'pick' to 'edit' for commit 790591a1
# - Save and close

# Now edit the files to remove credentials
# (Files are already fixed in working directory)

# Stage the changes
git add DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md

# Amend the commit
git commit --amend --no-edit

# Continue the rebase
git rebase --continue

# Force push (this rewrites history)
git push --force-with-lease
```

### Option 2: Filter-Branch (Nuclear Option)

```bash
# Remove the files from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md" \
  --prune-empty --tag-name-filter cat -- --all

# Re-add the files with fixed content
git add DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md
git commit -m "docs: Add deployment documentation (credentials removed)"

# Force push
git push --force-with-lease
```

### Option 3: Simplest - Delete and Recreate Files

```bash
# Remove the problematic files from git history
git rm --cached DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md
git commit -m "docs: Remove files with exposed credentials"

# Re-add them with clean content
git add DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md
git commit -m "docs: Re-add deployment documentation (credentials removed)"

# Push
git push
```

### Option 4: Use GitHub's Allow Secret Feature (Temporary)

If you've already rotated the credentials:
1. Click the GitHub link in the error message
2. Allow the secret (since it's now invalid)
3. Push normally

---

## After Fixing

1. **Rotate AWS Credentials:**
   ```bash
   aws iam create-access-key --user-name Akhilesh
   aws iam delete-access-key --access-key-id AKIA2ZOL5CIVZRYD46FA --user-name Akhilesh
   ```

2. **Verify Push:**
   ```bash
   git push
   ```

---

## Recommended: Option 3 (Simplest)

Run these commands:

```bash
# Remove files from git
git rm --cached DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md

# Commit the removal
git commit -m "docs: Remove files with exposed credentials"

# Re-add with clean content
git add DEPLOYMENT_CHECKLIST.md FINAL_FIXES.md

# Commit the clean versions
git commit -m "docs: Re-add deployment documentation (credentials sanitized)"

# Push
git push
```

This creates new commits without the credentials!
