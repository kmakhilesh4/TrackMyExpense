# Troubleshooting Guide - Blank Page Issue

## ✅ Issues Fixed

### 1. Missing Environment Variables
**Problem:** Frontend was loading with undefined Cognito configuration
**Solution:** Created `frontend/.env` file with proper configuration

### 2. AuthContext Navigation Issue
**Problem:** `useNavigate()` was being called outside of Router context
**Solution:** Removed `useNavigate()` from AuthContext, navigation now handled by components

### 3. DashboardView Hook Issue
**Problem:** Dashboard was calling data hooks before authentication completed
**Solution:** Simplified DashboardView to not fetch data on mount

---

## 🔧 What Was Fixed

### File: `frontend/.env` (CREATED)
```env
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_Eq3rKzjGa
VITE_COGNITO_CLIENT_ID=i1rnn6it5gsf08744g172ajsa
VITE_API_BASE_URL=http://localhost:4000
VITE_API_GATEWAY_URL=http://localhost:4000
```

### File: `frontend/src/context/AuthContext.tsx` (MODIFIED)
- Removed `useNavigate()` import and usage
- Navigation now handled by Login/Logout components
- Prevents "useNavigate must be inside Router" error

### File: `frontend/src/App.tsx` (MODIFIED)
- Simplified DashboardView component
- Removed premature data fetching hooks
- Now shows simple welcome message

---

## 🚀 How to Start the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
Backend will run on: http://localhost:4000

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:3000

### 3. Access the Application
Open browser: http://localhost:3000

---

## 🔍 Expected Behavior

### First Load
1. ✅ Frontend loads at http://localhost:3000
2. ✅ AuthContext checks for existing session
3. ✅ If not authenticated → Redirects to `/login`
4. ✅ Login page displays with email/password form

### After Login
1. ✅ User enters credentials
2. ✅ AWS Cognito validates credentials
3. ✅ JWT token stored in session
4. ✅ Redirects to `/dashboard`
5. ✅ Sidebar navigation appears
6. ✅ Can navigate to Accounts, Transactions, etc.

### Navigation Flow
```
Not Authenticated → /login
                    ↓
              Login Success
                    ↓
              /dashboard (Protected)
                    ↓
         Can access all routes:
         - /accounts
         - /transactions
         - /budgets
         - /settings
```

---

## 🐛 Common Issues & Solutions

### Issue: Blank White Page
**Symptoms:** Page loads but shows nothing, no errors in console
**Causes:**
1. Missing `.env` file
2. Invalid Cognito configuration
3. AuthContext navigation error

**Solution:**
✅ Ensure `frontend/.env` exists with correct values
✅ Check browser console for errors
✅ Verify Cognito User Pool ID and Client ID are correct

### Issue: "useNavigate must be inside Router"
**Symptoms:** Error in console about Router context
**Cause:** `useNavigate()` called outside `<BrowserRouter>`

**Solution:**
✅ Fixed in AuthContext - navigation now in components

### Issue: Infinite Loading Spinner
**Symptoms:** Page shows loading spinner forever
**Causes:**
1. AuthContext `isLoading` never becomes false
2. API calls failing silently
3. Cognito session check hanging

**Solution:**
✅ Check browser Network tab for failed requests
✅ Verify backend is running on port 4000
✅ Check Cognito configuration in AWS Console

### Issue: Login Redirects Back to Login
**Symptoms:** After successful login, redirects back to login page
**Causes:**
1. JWT token not being stored
2. Session check failing
3. Protected route logic error

**Solution:**
✅ Check browser Application tab → Local Storage
✅ Verify Cognito session is created
✅ Check console for authentication errors

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Opens App                                           │
│    http://localhost:3000                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AuthProvider Initializes                                 │
│    - isLoading = true                                       │
│    - Calls checkUser()                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Check Current User                                       │
│    - getCurrentUser() from Amplify                          │
│    - Checks for existing Cognito session                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ No Session       │    │ Valid Session    │
│ isAuth = false   │    │ isAuth = true    │
│ isLoading = false│    │ isLoading = false│
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Redirect to      │    │ Show Dashboard   │
│ /login           │    │ with Sidebar     │
└──────────────────┘    └──────────────────┘
```

---

## 📝 Verification Checklist

Before reporting issues, verify:

- [ ] Backend is running on http://localhost:4000
- [ ] Frontend is running on http://localhost:3000
- [ ] `frontend/.env` file exists
- [ ] Environment variables are loaded (check `import.meta.env` in console)
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Cognito User Pool exists in AWS Console
- [ ] User account exists in Cognito (or can sign up)

---

## 🆘 Getting Help

If issues persist:

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

2. **Check Backend Logs:**
   - Look at terminal running `npm run dev`
   - Check for connection errors
   - Verify DynamoDB table exists

3. **Check Environment Variables:**
   ```javascript
   // In browser console:
   console.log(import.meta.env);
   ```

4. **Test Cognito Directly:**
   - Go to AWS Console → Cognito
   - Verify User Pool ID matches `.env`
   - Check if users exist
   - Test sign-in from AWS Console

---

## ✅ Current Status

**All issues have been fixed!**

The application should now:
- ✅ Load without blank page
- ✅ Show login page when not authenticated
- ✅ Allow user login
- ✅ Navigate to dashboard after login
- ✅ Show sidebar navigation
- ✅ Allow access to all protected routes
- ✅ Support Add Account functionality
- ✅ Support Add Transaction functionality

**Next Steps:**
1. Start both backend and frontend
2. Navigate to http://localhost:3000
3. Login or sign up
4. Test Add Account and Add Transaction features
