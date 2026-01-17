# Quick Deploy Guide - Profile Improvements

## 🚀 Fast Track Deployment (5 minutes)

### Step 1: Update Infrastructure (2 min)
```bash
cd infrastructure

# Update Cognito (8-hour sessions)
aws cloudformation deploy \
  --template-file templates/auth.yaml \
  --stack-name trackmyexpense-auth-prod \
  --parameter-overrides file://parameters/prod.json \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1

# Update S3 (CORS)
aws cloudformation deploy \
  --template-file templates/storage.yaml \
  --stack-name trackmyexpense-storage-prod \
  --parameter-overrides file://parameters/prod.json \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

### Step 2: Update Frontend .env (30 sec)
```bash
cd frontend

# Edit .env.prod - ensure these are set:
# VITE_S3_RECEIPTS_BUCKET=trackmyexpense-receipts-prod-741846356523
# VITE_AWS_REGION=ap-south-1
```

### Step 3: Build & Deploy (2 min)
```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete

# Invalidate CloudFront (get distribution ID from AWS Console)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Step 4: Test (30 sec)
1. Go to https://myexpenses.online
2. Click avatar (top-right) → Should go to Settings
3. Try uploading a profile picture
4. Try changing password

## ✅ What's New

1. **Profile Picture Upload** - Click camera icon on avatar
2. **Password Change** - "Change Password" button in Security section
3. **Profile Edit** - "Edit Profile" button to update name
4. **Budget Hidden** - No longer in sidebar (can re-enable later)
5. **8-Hour Sessions** - Stay logged in longer
6. **Avatar Navigation** - Click avatar → Settings

## 🔧 If Something Breaks

### Profile Picture Upload Fails
```bash
# Check S3 CORS
aws s3api get-bucket-cors \
  --bucket trackmyexpense-receipts-prod-741846356523
```

### Session Still Expires After 1 Hour
- Clear browser cache and cookies
- Logout and login again
- Check Cognito stack deployed successfully

### Budget Still Visible
```bash
# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 📚 Full Documentation
- `IMPROVEMENTS_SUMMARY.md` - Complete feature list
- `DEPLOY_PROFILE_UPDATES.md` - Detailed deployment guide
- `PROFILE_IMPROVEMENTS.md` - Technical details

## 🎯 Quick Test Checklist
- [ ] Avatar click → Settings page
- [ ] Upload profile picture works
- [ ] Change password works
- [ ] Edit name works
- [ ] Budget menu hidden
- [ ] Session lasts 8 hours

Done! 🎉
