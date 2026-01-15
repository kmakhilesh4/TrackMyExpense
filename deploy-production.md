# Quick Production Deployment Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Deploy Backend (2 minutes)

```bash
cd backend

# Build and deploy
npm run build
serverless deploy --stage prod --region ap-south-1
```

**Wait for:** "Service deployed successfully" message

---

### Step 2: Deploy Frontend (2 minutes)

```bash
cd frontend

# Build for production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523 --delete
```

---

### Step 3: Test (1 minute)

Open: http://trackmyexpense-frontend-prod-741846356523.s3-website.ap-south-1.amazonaws.com

Test:
- ✅ Login
- ✅ Add Account
- ✅ Add Category
- ✅ Add Transaction

---

## ✅ That's it!

Your app is now live in production!

---

## 🔧 If Something Goes Wrong

### Backend Issues:
```bash
# Check logs
serverless logs -f listAccounts --stage prod --tail

# Rollback
serverless rollback --timestamp PREVIOUS_TIMESTAMP --stage prod
```

### Frontend Issues:
```bash
# Check what's deployed
aws s3 ls s3://trackmyexpense-frontend-prod-741846356523/

# Re-deploy
cd frontend
npm run build
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523 --delete
```

---

## 📊 Monitor

Check CloudWatch:
https://console.aws.amazon.com/cloudwatch/home?region=ap-south-1

Check API Gateway:
https://console.aws.amazon.com/apigateway/home?region=ap-south-1

---

## 🎉 Success!

Your TrackMyExpense app is now running in production!
