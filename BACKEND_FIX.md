# Backend Local Development Fix ✅

## Problem
Backend was failing to start with error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'D:\...\backend\src\local.ts'
```

## Root Causes

### 1. Missing `local.ts` File ❌
The `package.json` dev script was trying to run `tsx watch src/local.ts`, but this file didn't exist.

### 2. Missing `.env` File ❌
Backend had no `.env` file for local development environment variables.

### 3. Auth Middleware Initialization Issue ❌
The Cognito JWT verifier was being created at module load time when environment variables weren't loaded yet.

---

## Solutions Applied

### ✅ Solution 1: Created `local.ts` Server
**File:** `backend/src/local.ts`

Created an Express server that wraps Lambda handlers for local development:
- Converts Lambda events to Express requests
- Handles all API routes (accounts, transactions, categories, budgets)
- Includes CORS, helmet, compression middleware
- Runs on port 4000

### ✅ Solution 2: Created `.env` File
**File:** `backend/.env`

```env
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=741846356523
DYNAMODB_TABLE_NAME=TrackMyExpense-prod
S3_RECEIPTS_BUCKET=trackmyexpense-receipts-prod-741846356523
COGNITO_USER_POOL_ID=ap-south-1_Eq3rKzjGa
COGNITO_CLIENT_ID=i1rnn6it5gsf08744g172ajsa
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### ✅ Solution 3: Fixed Auth Middleware
**File:** `backend/src/middleware/auth.middleware.ts`

**Before:**
```typescript
// Created at module load time - env vars not loaded yet!
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID || ''
});
```

**After:**
```typescript
// Lazy-loaded when first needed
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
    if (!verifier) {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        if (!userPoolId) {
            throw new Error('COGNITO_USER_POOL_ID not set');
        }
        verifier = CognitoJwtVerifier.create({ userPoolId });
    }
    return verifier;
}
```

---

## How to Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:4000
📊 Environment: development
🗄️  DynamoDB Table: TrackMyExpense-prod
🔐 Cognito User Pool: ap-south-1_Eq3rKzjGa
```

---

## API Endpoints Available

### Health Check
- `GET /health` - Server health status

### Accounts
- `GET /accounts` - List all accounts
- `POST /accounts` - Create new account
- `PATCH /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Transactions
- `GET /transactions` - List transactions (with filters)
- `POST /transactions` - Create transaction (atomic with balance update)
- `DELETE /transactions?sk=TX#...` - Delete transaction

### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Budgets
- `GET /budgets` - List budgets
- `POST /budgets` - Create budget
- `PATCH /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget

---

## Testing the Backend

### 1. Health Check
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T..."
}
```

### 2. Test with Frontend
1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Open http://localhost:3000
4. Login and test Add Account/Transaction features

---

## Files Created/Modified

### Created Files
1. ✅ `backend/src/local.ts` - Express server for local dev
2. ✅ `backend/.env` - Environment variables

### Modified Files
1. ✅ `backend/src/middleware/auth.middleware.ts` - Lazy-load verifier

---

## Architecture: Local vs Production

### Local Development (Express)
```
Frontend (localhost:3000)
    ↓ HTTP Request
Express Server (localhost:4000)
    ↓ Lambda Handler Wrapper
Lambda Functions (account.ts, transaction.ts, etc.)
    ↓ Service Layer
    ↓ Repository Layer
DynamoDB (AWS)
```

### Production (Serverless)
```
Frontend (CloudFront)
    ↓ HTTPS Request
API Gateway
    ↓ Lambda Invocation
Lambda Functions
    ↓ Service Layer
    ↓ Repository Layer
DynamoDB (AWS)
```

**Key Point:** Same Lambda handlers work in both environments!

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `AWS_REGION` | AWS region for services | `ap-south-1` |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name | `TrackMyExpense-prod` |
| `COGNITO_USER_POOL_ID` | Cognito user pool | `ap-south-1_Eq3rKzjGa` |
| `COGNITO_CLIENT_ID` | Cognito app client | `i1rnn6it5gsf08744g172ajsa` |
| `PORT` | Local server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |

---

## Common Issues

### Issue: Port 4000 Already in Use
**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=4001
```

### Issue: DynamoDB Access Denied
**Solution:**
- Ensure AWS credentials are configured
- Run `aws configure` to set up credentials
- Or use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env

### Issue: Cognito Verification Fails
**Solution:**
- Verify COGNITO_USER_POOL_ID is correct
- Verify COGNITO_CLIENT_ID is correct
- Check AWS Console → Cognito → User Pools

---

## Status: ✅ RESOLVED

Backend is now running successfully on http://localhost:4000

Both frontend and backend are ready for development and testing!
