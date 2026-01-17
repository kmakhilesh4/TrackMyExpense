# Profile Picture Feature - Deployment Guide

## 🎯 Current Status

**Backend:** ⚠️ NEEDS DEPLOYMENT
- Profile endpoints added to `serverless.yml`
- Profile handler implemented in `backend/src/functions/profile.ts`
- **NOT YET DEPLOYED TO AWS**

**Frontend:** ✅ READY
- Upload/delete functionality implemented
- Cognito attribute integration complete
- Bug fixes applied for logout persistence

**Infrastructure:** ✅ DEPLOYED
- S3 bucket policy allows public read for profile pictures
- Cognito configured with `picture` attribute

## 🚀 Deployment Steps

### Step 1: Deploy Backend API (REQUIRED)

The backend has 3 new endpoints that need to be deployed:

```bash
cd backend

# Install dependencies (if needed)
npm install

# Deploy to AWS
npx serverless deploy --stage prod --region ap-south-1
```

**New Endpoints:**
- `POST /profile/picture` - Upload profile picture
- `DELETE /profile/picture` - Delete profile picture  
- `GET /profile/picture/url` - Get signed URL (not currently used)

**Expected Output:**
```
✔ Service deployed to stack trackmyexpense-backend-prod
endpoints:
  ...
  POST - https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/profile/picture
  DELETE - https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/profile/picture
  GET - https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/profile/picture/url
```

### Step 2: Build Frontend

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build
```

### Step 3: Deploy Frontend

```bash
# Still in frontend directory

# Sync to S3
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**Note:** Replace `YOUR_DISTRIBUTION_ID` with your actual CloudFront distribution ID.

### Step 4: Verify Deployment

1. **Check Backend Endpoints:**
```bash
# Test health endpoint
curl https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

2. **Check Frontend:**
- Open https://myexpenses.online
- Login to your account
- Go to Settings
- Try uploading a profile picture

3. **Check S3:**
```bash
# List profile pictures
aws s3 ls s3://trackmyexpense-receipts-prod-741846356523/public/profile-pictures/
```

## 🧪 Testing Checklist

### Test 1: Upload Profile Picture
- [ ] Login to app
- [ ] Go to Settings page
- [ ] Click camera icon on avatar
- [ ] Select an image (< 5MB)
- [ ] See success message
- [ ] Picture displays immediately
- [ ] Check browser console - no errors

### Test 2: Picture Persists After Logout
- [ ] Upload a picture (if not already done)
- [ ] Verify picture displays in top-right avatar
- [ ] Click Logout
- [ ] Login again with same account
- [ ] **Picture should still be there** ✅
- [ ] Check browser console for logs:
  - "Loaded user attributes: ..."
  - "Setting profile picture URL: ..."

### Test 3: Remove Profile Picture
- [ ] Go to Settings
- [ ] Click "Remove Photo" button
- [ ] Picture disappears
- [ ] Avatar shows initial letter
- [ ] Check S3 - file should be deleted

### Test 4: Cross-Device Sync
- [ ] Upload picture on Device A
- [ ] Open app on Device B
- [ ] Login with same account
- [ ] Picture should appear automatically

### Test 5: Cross-User Isolation
- [ ] Login as User A
- [ ] Upload picture (e.g., cat photo)
- [ ] Logout
- [ ] Login as User B
- [ ] Should see NO picture (User B's default)
- [ ] Upload different picture (e.g., dog photo)
- [ ] Logout
- [ ] Login as User A again
- [ ] Should see original picture (cat photo)

## 🐛 Bug Fixes Applied

### Issue: Picture Disappears After Logout

**What was wrong:**
- The `useEffect` in `MainLayout.tsx` was using `[user]` as dependency
- When user object changed after login, effect wasn't re-running properly
- Cognito attributes weren't being re-fetched

**What was fixed:**
1. Changed dependency from `[user]` to `[user?.userId, user?.username]`
2. Added console logging for debugging
3. Reduced refresh interval from 60s to 30s
4. Added explicit null check and clear when no user
5. Force reload attributes after upload/remove in Settings

**Files Modified:**
- `frontend/src/components/layout/MainLayout.tsx`
- `frontend/src/pages/Settings.tsx`

## 📊 Monitoring

### Check Logs

**Backend Logs (CloudWatch):**
```bash
# View Lambda logs
aws logs tail /aws/lambda/trackmyexpense-backend-prod-uploadProfilePicture --follow

# View all backend logs
aws logs tail /aws/lambda/trackmyexpense-backend-prod --follow
```

**Frontend Logs:**
- Open browser DevTools
- Check Console tab
- Look for profile picture related logs

### Check S3 Storage

```bash
# List all profile pictures
aws s3 ls s3://trackmyexpense-receipts-prod-741846356523/public/profile-pictures/ --recursive --human-readable

# Check total size
aws s3 ls s3://trackmyexpense-receipts-prod-741846356523/public/profile-pictures/ --recursive --summarize
```

### Check Cognito Attributes

```bash
# Get user attributes
aws cognito-idp admin-get-user \
  --user-pool-id ap-south-1_Eq3rKzjGa \
  --username YOUR_EMAIL \
  --region ap-south-1

# Look for "picture" attribute in the output
```

## 🔒 Security Verification

### S3 Bucket Policy
```bash
# Get bucket policy
aws s3api get-bucket-policy \
  --bucket trackmyexpense-receipts-prod-741846356523 \
  --query Policy \
  --output text | jq .

# Should show public read access for profile-pictures/*
```

### IAM Permissions
```bash
# Check Lambda execution role has S3 permissions
aws iam get-role-policy \
  --role-name trackmyexpense-backend-prod-REGION-lambdaRole \
  --policy-name trackmyexpense-backend-prod-lambda

# Should include s3:PutObject, s3:GetObject, s3:DeleteObject
```

## 🚨 Rollback Plan

If something goes wrong:

### Rollback Backend
```bash
cd backend

# List deployments
npx serverless deploy list --stage prod

# Rollback to previous version
npx serverless rollback --timestamp TIMESTAMP --stage prod
```

### Rollback Frontend
```bash
# Re-deploy previous version from git
git checkout PREVIOUS_COMMIT
cd frontend
npm run build
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete
```

## 📝 Post-Deployment Tasks

1. **Update Documentation:**
   - [ ] Mark deployment as complete in this file
   - [ ] Update CHANGELOG.md with new feature
   - [ ] Update README.md if needed

2. **Notify Users:**
   - [ ] Announce new profile picture feature
   - [ ] Provide instructions on how to use it

3. **Monitor for 24 Hours:**
   - [ ] Check CloudWatch logs for errors
   - [ ] Monitor S3 storage costs
   - [ ] Check user feedback

## ✅ Deployment Complete Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All 5 tests passed
- [ ] No errors in CloudWatch logs
- [ ] No errors in browser console
- [ ] Profile pictures persist after logout
- [ ] Cross-user isolation working
- [ ] Documentation updated
- [ ] Team notified

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Users can upload profile pictures
2. ✅ Pictures display in Settings and top-right avatar
3. ✅ Pictures persist after logout/login
4. ✅ Pictures sync across devices
5. ✅ Each user sees only their own picture
6. ✅ Users can remove their pictures
7. ✅ No errors in logs

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check CloudWatch logs for backend errors
3. Verify S3 bucket policy is correct
4. Verify Cognito attributes are set
5. Try clearing browser cache
6. Try uploading a new picture

## 🔗 Related Documentation

- `S3_PROFILE_PICTURES.md` - Technical implementation details
- `PROFILE_IMPROVEMENTS.md` - All profile features
- `DEPLOY_PROFILE_UPDATES.md` - Original deployment guide
- `backend/src/functions/profile.ts` - Backend code
- `frontend/src/pages/Settings.tsx` - Frontend code
