# Deploy Profile Updates - Quick Guide

## Overview
This guide covers deploying the new profile management features including profile picture upload, password change, profile editing, 8-hour sessions, and hiding the budget feature.

## Step 1: Update Infrastructure (Cognito & S3)

### 1.1 Update Cognito User Pool (8-hour sessions + picture attribute)

```bash
cd infrastructure

# For production
aws cloudformation deploy \
  --template-file templates/auth.yaml \
  --stack-name trackmyexpense-auth-prod \
  --parameter-overrides file://parameters/prod.json \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

**What this does:**
- Extends session from 1 hour to 8 hours
- Adds `picture` attribute to user schema
- Allows users to store profile picture URLs

### 1.2 Update S3 Bucket (CORS for custom domain)

```bash
# Still in infrastructure directory
aws cloudformation deploy \
  --template-file templates/storage.yaml \
  --stack-name trackmyexpense-storage-prod \
  --parameter-overrides file://parameters/prod.json \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

**What this does:**
- Adds CORS rules for myexpenses.online and www.myexpenses.online
- Allows profile picture uploads from your custom domain

## Step 2: Update Frontend Environment Variables

Update `frontend/.env.prod`:

```bash
# Add or update these variables
VITE_S3_RECEIPTS_BUCKET=trackmyexpense-receipts-prod-741846356523
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=<your-pool-id>
VITE_COGNITO_CLIENT_ID=<your-client-id>
VITE_API_GATEWAY_URL=<your-api-url>
```

## Step 3: Build and Deploy Frontend

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <your-distribution-id> \
  --paths "/*"
```

## Step 4: Verify Deployment

### Test Profile Picture Upload
1. Go to https://myexpenses.online
2. Login to your account
3. Click avatar in top-right → should navigate to Settings
4. Click camera icon on profile picture
5. Upload an image (max 5MB)
6. Verify it displays correctly

### Test Password Change
1. In Settings, click "Change Password"
2. Enter current password
3. Enter new password (min 8 chars, with uppercase, lowercase, number, symbol)
4. Confirm new password
5. Click "Change Password"
6. Verify success message

### Test Profile Edit
1. In Settings, click "Edit Profile"
2. Change your name
3. Click "Save Changes"
4. Verify name updates

### Test Session Duration
1. Login to the app
2. Leave it open for 2-3 hours
3. Verify you're still logged in (no redirect to login)
4. Session should last 8 hours now

### Test Budget Hidden
1. Check sidebar - Budget menu item should not be visible
2. Try navigating to /budgets - should redirect to dashboard

## Step 5: Check IAM Permissions (If Upload Fails)

If profile picture upload fails, check Cognito Identity Pool authenticated role has S3 permissions:

```bash
# Get your Identity Pool authenticated role
aws cognito-identity describe-identity-pool \
  --identity-pool-id <your-identity-pool-id> \
  --region ap-south-1

# Check the role's policies
aws iam get-role-policy \
  --role-name <authenticated-role-name> \
  --policy-name <policy-name>
```

The policy should include:

```json
{
    "Effect": "Allow",
    "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
    ],
    "Resource": [
        "arn:aws:s3:::trackmyexpense-receipts-prod-741846356523/private/${cognito-identity.amazonaws.com:sub}/*"
    ]
}
```

## Troubleshooting

### Profile Picture Upload Fails
- **Check CORS**: Verify S3 bucket CORS includes your domain
- **Check IAM**: Verify authenticated role has S3 permissions
- **Check Browser Console**: Look for CORS or permission errors
- **Check File Size**: Must be under 5MB
- **Check File Type**: Must be an image

### Password Change Fails
- **Check Password Requirements**: Min 8 chars, uppercase, lowercase, number, symbol
- **Check Current Password**: Must be correct
- **Check Passwords Match**: New password and confirm must match

### Session Still Expires After 1 Hour
- **Check Cognito Update**: Verify auth stack deployed successfully
- **Clear Browser Cache**: Clear cookies and local storage
- **Re-login**: Logout and login again to get new tokens

### Budget Still Visible
- **Check Frontend Build**: Verify you built and deployed the latest code
- **Clear CloudFront Cache**: Run invalidation command
- **Hard Refresh**: Ctrl+Shift+R or Cmd+Shift+R

## Rollback (If Needed)

### Rollback Cognito Changes
```bash
# Revert to previous stack version
aws cloudformation deploy \
  --template-file templates/auth.yaml \
  --stack-name trackmyexpense-auth-prod \
  --parameter-overrides \
    AccessTokenValidity=1 \
    IdTokenValidity=1 \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

### Rollback Frontend
```bash
# Deploy previous version from git
git checkout <previous-commit>
cd frontend
npm run build
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

## Summary of Changes

✅ **Profile Picture Upload** - Users can upload and display profile pictures  
✅ **Password Change** - Secure password update with validation  
✅ **Profile Edit** - Update name and other profile info  
✅ **8-Hour Sessions** - Extended from 1 hour to 8 hours  
✅ **Budget Hidden** - Menu item and route removed (can re-enable later)  
✅ **Profile Navigation** - Click avatar to go to settings  

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Monitor CloudWatch logs for errors
3. Check user feedback
4. Consider adding more profile fields (phone, timezone, currency)
5. Plan budget feature re-launch when ready
