# Production Deployment Checklist

## ⚠️ Critical Items to Update Before Deployment

### 1. Remove AWS Credentials from Backend .env
**SECURITY RISK:** Never commit AWS credentials to git!

**Action Required:**
```bash
# backend/.env - Remove these lines:
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
```

**Why:** 
- Lambda functions use IAM roles, not hardcoded credentials
- Credentials in code are a security vulnerability
- These credentials are already exposed in our conversation

**Solution:**
- For local development: Use AWS CLI credentials (`~/.aws/credentials`)
- For production: Lambda uses IAM role automatically

---

### 2. Update .gitignore
Ensure sensitive files are not committed:

```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.prod
.env.production

# AWS credentials
.aws/

# Build outputs
dist/
build/
.serverless/

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
```

---

### 3. Frontend Environment Variables
Update `frontend/.env.production` with production values:

```env
# Use production API Gateway URL (not localhost!)
VITE_API_BASE_URL=https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod
VITE_API_GATEWAY_URL=https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod

# Cognito (already correct)
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_Eq3rKzjGa
VITE_COGNITO_CLIENT_ID=i1rnn6it5gsf08744g172ajsa

# S3
VITE_S3_BUCKET_NAME=trackmyexpense-receipts-prod-741846356523
VITE_S3_REGION=ap-south-1

# App
VITE_APP_NAME=TrackMyExpense
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

---

### 4. Backend Serverless Configuration
Check `backend/serverless.yml` is using production values:

```yaml
provider:
  stage: ${opt:stage, 'prod'}
  environment:
    DYNAMODB_TABLE_NAME: TrackMyExpense-prod
    COGNITO_USER_POOL_ID: ap-south-1_Eq3rKzjGa
    COGNITO_CLIENT_ID: i1rnn6it5gsf08744g172ajsa
    S3_RECEIPTS_BUCKET: trackmyexpense-receipts-prod-741846356523
```

---

### 5. Remove Debug Logging
Remove console.log statements from production code:

**Files to check:**
- `backend/src/env.ts` - Remove all console.log
- `backend/src/utils/dynamodb.ts` - Remove debug logs
- `frontend/src/context/AuthContext.tsx` - Remove console.log

---

### 6. Build and Test Locally

**Backend:**
```bash
cd backend
npm run build
npm run lint
```

**Frontend:**
```bash
cd frontend
npm run build
npm run lint
```

---

## 📋 Deployment Steps

### Step 1: Deploy Backend (Lambda + API Gateway)

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to AWS
npm run deploy
# OR
serverless deploy --stage prod --region ap-south-1
```

**Expected Output:**
```
✔ Service deployed to stack trackmyexpense-backend-prod
endpoints:
  GET - https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod/health
  GET - https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod/accounts
  POST - https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod/accounts
  ... (all endpoints)
```

---

### Step 2: Test Backend Endpoints

```bash
# Test health endpoint
curl https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod/health

# Expected: {"success":true,"message":"API is healthy"}
```

---

### Step 3: Deploy Frontend (S3 + CloudFront)

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523 --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

### Step 4: Verify Deployment

1. **Open Production URL:**
   - S3: http://trackmyexpense-frontend-prod-741846356523.s3-website.ap-south-1.amazonaws.com
   - CloudFront: https://your-cloudfront-domain.cloudfront.net

2. **Test Core Features:**
   - [ ] Login works
   - [ ] Can view accounts
   - [ ] Can add account
   - [ ] Can view transactions
   - [ ] Can add category
   - [ ] Can add transaction
   - [ ] Settings shows user info
   - [ ] Navigation works

3. **Check Browser Console:**
   - [ ] No errors
   - [ ] API calls go to production endpoint
   - [ ] Authentication works

---

## 🔒 Security Checklist

### Before Deployment:
- [ ] Remove AWS credentials from `.env` files
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Verify CORS settings in API Gateway
- [ ] Check IAM roles have minimum required permissions
- [ ] Enable CloudWatch logging for Lambda
- [ ] Enable DynamoDB point-in-time recovery
- [ ] Enable S3 bucket encryption
- [ ] Set up CloudFront with HTTPS

### After Deployment:
- [ ] Rotate AWS credentials used in development
- [ ] Set up AWS CloudWatch alarms
- [ ] Enable AWS WAF for API Gateway (optional)
- [ ] Set up backup strategy for DynamoDB
- [ ] Monitor costs in AWS Cost Explorer

---

## 🚨 Known Issues to Fix Later

### Minor Issues (Non-blocking):
1. **User Profile:** Settings page shows email-derived username, not full name
2. **Transaction Edit:** No edit functionality yet
3. **Transaction Delete:** No delete functionality yet
4. **Account Edit:** No edit functionality yet
5. **Account Delete:** No delete functionality yet
6. **Search/Filter:** UI exists but not wired up
7. **Export:** Button exists but not functional
8. **Receipt Upload:** Not implemented
9. **Budget Management:** Page exists but not fully functional
10. **Dashboard:** Shows placeholder content

### These can be addressed in future releases!

---

## 📊 Post-Deployment Monitoring

### Metrics to Watch:
1. **Lambda Errors:** Check CloudWatch for function errors
2. **API Gateway 4xx/5xx:** Monitor error rates
3. **DynamoDB Throttling:** Watch for capacity issues
4. **Cognito Sign-ins:** Monitor authentication success rate
5. **S3 Bandwidth:** Monitor data transfer costs

### CloudWatch Alarms to Set:
- Lambda error rate > 5%
- API Gateway 5xx errors > 1%
- DynamoDB read/write throttling
- Cognito authentication failures

---

## 🔄 Rollback Plan

If deployment fails:

### Backend Rollback:
```bash
cd backend
serverless rollback --timestamp TIMESTAMP --stage prod
```

### Frontend Rollback:
```bash
# Restore previous S3 version
aws s3 sync s3://backup-bucket/ s3://trackmyexpense-frontend-prod-741846356523/
```

---

## ✅ Pre-Deployment Commands

Run these before deploying:

```bash
# 1. Clean backend .env
cd backend
# Remove AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY lines

# 2. Build backend
npm run build

# 3. Build frontend
cd ../frontend
npm run build

# 4. Check for errors
npm run lint

# 5. Test production build locally
npm run preview
```

---

## 🎯 Deployment Order

1. ✅ Infrastructure (DynamoDB, Cognito, S3) - Already deployed
2. 🚀 Backend (Lambda + API Gateway) - Deploy now
3. 🚀 Frontend (S3 + CloudFront) - Deploy after backend
4. ✅ Test end-to-end
5. ✅ Monitor for 24 hours

---

## 📝 Post-Deployment Tasks

### Immediate:
- [ ] Test all features in production
- [ ] Check CloudWatch logs for errors
- [ ] Verify API Gateway endpoints
- [ ] Test authentication flow
- [ ] Create test account and add data

### Within 24 Hours:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review costs in AWS Cost Explorer
- [ ] Set up CloudWatch alarms
- [ ] Document any issues

### Within 1 Week:
- [ ] Gather user feedback
- [ ] Plan next iteration
- [ ] Address any critical bugs
- [ ] Optimize performance if needed

---

## 🎉 Ready to Deploy!

Your application is ready for production deployment with these steps:

1. **Clean up credentials** (CRITICAL!)
2. **Build backend and frontend**
3. **Deploy backend** (`serverless deploy`)
4. **Deploy frontend** (`aws s3 sync`)
5. **Test thoroughly**
6. **Monitor and celebrate!** 🎊

Good luck with your deployment!
