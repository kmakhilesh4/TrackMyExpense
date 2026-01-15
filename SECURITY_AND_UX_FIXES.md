# Security and UX Fixes - January 15, 2026

## Critical Security Fix: Data Isolation Between Users

### Issue
- User A could see User B's transactions, accounts, and categories after logout/login
- React Query was caching data and not clearing it on logout

### Root Cause
- Backend authentication was working correctly (filtering by userId)
- Frontend React Query cache was persisting across user sessions
- No cache invalidation on logout/login events

### Solution
1. **Added React Query cache clearing on logout:**
   - Import `useQueryClient` in AuthContext
   - Call `queryClient.clear()` in logout function
   - Call `queryClient.clear()` on Hub 'signedOut' event
   - Call `queryClient.clear()` on Hub 'signedIn' event

2. **Files Modified:**
   - `frontend/src/context/AuthContext.tsx`

### Testing
- Logout and login with different users
- Verify no data from previous user is visible
- Verify fresh data loads for new user

---

## UX Improvements

### 1. Currency Symbol Display
**Issue:** All accounts showed "$" regardless of currency

**Solution:**
- Added `getCurrencySymbol()` helper function
- Maps currency codes to symbols (USD→$, EUR→€, INR→₹, etc.)
- Applied to both Accounts page and AddTransactionDialog

**Files Modified:**
- `frontend/src/pages/Accounts.tsx`
- `frontend/src/components/common/AddTransactionDialog.tsx`

### 2. Account Management Features
**Added:**
- **Edit Balance:** Click menu → Edit Balance → Update account balance
- **Delete Account:** Click menu → Delete Account → Confirmation dialog with warning
- **Double confirmation:** Delete dialog warns about removing associated transactions

**Files Modified:**
- `frontend/src/pages/Accounts.tsx`
- `frontend/src/hooks/useAccounts.ts` (added updateAccount and deleteAccount mutations)

### 3. Settings Page User Details
**Issue:** Showed Cognito userId twice instead of name and email

**Solution:**
- Added `fetchUserAttributes()` from AWS Amplify
- Properly displays user's name and email from Cognito attributes
- Added loading state while fetching

**Files Modified:**
- `frontend/src/pages/Settings.tsx`

### 4. Category Management
**Issue:** "Add Category" option disappeared after creating first category

**Solution:**
- Added persistent "+ Add New Category" button below category dropdown
- Always visible regardless of category count
- Fixed category type filtering logic (expense vs income)

**Files Modified:**
- `frontend/src/components/common/AddTransactionDialog.tsx`

---

## Backend Verification

### Confirmed Working:
- ✅ All repositories filter by userId correctly
- ✅ Auth middleware extracts userId from JWT token
- ✅ API endpoints require authentication
- ✅ DynamoDB queries use composite keys (UserId + EntityType)

### Key Pattern:
```
UserId: USER#{userId}
EntityType: ACCOUNT#{accountId} | CATEGORY#{categoryId} | TX#{date}#{txId}
```

---

## Deployment Notes

1. **Frontend changes only** - no backend deployment needed
2. **Clear browser cache** after deployment to ensure users get fresh code
3. **Test with multiple users** to verify data isolation
4. **Monitor for 401 errors** in production logs

---

## Security Best Practices Applied

1. ✅ JWT token verification on every API request
2. ✅ User data isolation at database level
3. ✅ Cache clearing on authentication state changes
4. ✅ Confirmation dialogs for destructive actions
5. ✅ Proper error handling and user feedback

---

## Build Status

✅ Frontend build successful
✅ No TypeScript errors
✅ All diagnostics passed
✅ Ready for production deployment
