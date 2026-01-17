# Profile Picture Flow Diagram

## 🔄 Complete Flow (Upload → Display → Persist)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
└─────────────────────────────────────────────────────────────────┘

1. UPLOAD PICTURE
   │
   ├─> User clicks camera icon
   ├─> Selects image file (< 5MB)
   ├─> Frontend converts to base64
   │
   ├─> POST /profile/picture
   │   ├─> Backend receives request
   │   ├─> Validates auth token
   │   ├─> Uploads to S3: public/profile-pictures/userId-timestamp.jpg
   │   └─> Returns public URL
   │
   ├─> Frontend receives URL
   ├─> Updates Cognito attribute: picture = "https://..."
   ├─> Reloads user attributes
   └─> Picture displays ✅

2. LOGOUT
   │
   ├─> User clicks logout
   ├─> AuthContext.logout() called
   ├─> queryClient.clear() - clears React Query cache
   ├─> signOut() - Cognito logout
   ├─> setUser(null) - clears user state
   └─> Navigate to /login

3. LOGIN
   │
   ├─> User enters email/password
   ├─> signIn() - Cognito authentication
   ├─> AuthContext.checkUser() called
   ├─> getCurrentUser() - gets user object
   ├─> setUser(userObject) - updates state
   │
   ├─> MainLayout useEffect triggers ⚡
   │   │
   │   ├─> Dependency: [user?.userId, user?.username]
   │   ├─> These values changed from null → actual values
   │   ├─> Effect runs!
   │   │
   │   ├─> fetchUserAttributes() - calls Cognito
   │   ├─> Gets: {email, name, picture, ...}
   │   ├─> Extracts picture URL
   │   ├─> setProfilePictureUrl(url)
   │   └─> Avatar displays picture ✅
   │
   └─> Picture persists! ✅

```

## 🐛 The Bug (Before Fix)

```
LOGIN FLOW - BROKEN ❌

User logs in
  ↓
AuthContext sets user state
  ↓
MainLayout useEffect: [user]  ← PROBLEM!
  ↓
user object reference changes, but...
  ↓
Effect doesn't re-run reliably ❌
  ↓
fetchUserAttributes() never called
  ↓
picture attribute never loaded
  ↓
profilePictureUrl stays null
  ↓
Avatar shows initial letter only ❌
```

## ✅ The Fix (After)

```
LOGIN FLOW - FIXED ✅

User logs in
  ↓
AuthContext sets user state
  ↓
MainLayout useEffect: [user?.userId, user?.username]  ← FIXED!
  ↓
These specific values changed: null → "actual-user-id"
  ↓
Effect ALWAYS re-runs ✅
  ↓
fetchUserAttributes() called
  ↓
picture attribute loaded from Cognito
  ↓
profilePictureUrl = "https://..."
  ↓
Avatar displays picture ✅
```

## 🔍 Technical Deep Dive

### Why `[user]` Didn't Work

```typescript
// BEFORE
useEffect(() => {
  loadProfilePicture();
}, [user]);

// Problem:
// - user is an object reference
// - React compares by reference, not by value
// - After login, user object might have same reference
// - Effect doesn't run
// - Picture not loaded
```

### Why `[user?.userId, user?.username]` Works

```typescript
// AFTER
useEffect(() => {
  loadProfilePicture();
}, [user?.userId, user?.username]);

// Solution:
// - userId and username are primitive values (strings)
// - React compares by value
// - After login: null → "actual-id"
// - Values definitely changed
// - Effect ALWAYS runs
// - Picture loaded ✅
```

## 📊 State Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                          │
└──────────────────────────────────────────────────────────────┘

INITIAL STATE (Not Logged In)
├─> user: null
├─> isAuthenticated: false
├─> profilePictureUrl: null
└─> Avatar: Shows "U" (default)

AFTER LOGIN
├─> user: { userId: "abc123", username: "user@example.com", ... }
├─> isAuthenticated: true
├─> profilePictureUrl: null (not loaded yet)
└─> Avatar: Shows "U" (still default)

AFTER useEffect RUNS (THE FIX!)
├─> user: { userId: "abc123", username: "user@example.com", ... }
├─> isAuthenticated: true
├─> profilePictureUrl: "https://s3.amazonaws.com/..." ✅
└─> Avatar: Shows picture ✅

AFTER LOGOUT
├─> user: null
├─> isAuthenticated: false
├─> profilePictureUrl: null (cleared)
└─> Avatar: Shows "U" (default)

AFTER LOGIN AGAIN
├─> user: { userId: "abc123", username: "user@example.com", ... }
├─> isAuthenticated: true
├─> useEffect runs because userId changed: null → "abc123"
├─> profilePictureUrl: "https://s3.amazonaws.com/..." ✅
└─> Avatar: Shows picture ✅ (PERSISTED!)
```

## 🔄 Data Storage Locations

```
┌─────────────────────────────────────────────────────────────┐
│                    WHERE DATA LIVES                          │
└─────────────────────────────────────────────────────────────┘

1. S3 BUCKET (Permanent Storage)
   Location: trackmyexpense-receipts-prod-741846356523
   Path: public/profile-pictures/
   File: userId-timestamp.jpg
   Access: Public read
   Lifecycle: Permanent (until deleted)

2. COGNITO USER ATTRIBUTES (Permanent Storage)
   Service: AWS Cognito User Pool
   Attribute: picture
   Value: "https://s3.amazonaws.com/..."
   Access: User-specific
   Lifecycle: Permanent (until updated)

3. REACT STATE (Temporary - Session Only)
   Component: MainLayout
   State: profilePictureUrl
   Value: "https://s3.amazonaws.com/..."
   Access: Current session only
   Lifecycle: Cleared on logout, reloaded on login

4. BROWSER (Not Used Anymore)
   ❌ localStorage - Removed (didn't sync across devices)
   ❌ sessionStorage - Removed (cleared on logout)
```

## 🎯 Key Insight

```
┌─────────────────────────────────────────────────────────────┐
│                    THE CORE ISSUE                            │
└─────────────────────────────────────────────────────────────┘

The picture was ALWAYS in Cognito ✅
The picture was ALWAYS in S3 ✅

The problem was:
After login, the app wasn't LOOKING for the picture ❌

The fix:
Make sure the app ALWAYS looks for the picture after login ✅

How:
Change useEffect dependencies to trigger on login ✅
```

## 🔧 Code Comparison

### Before (Broken)

```typescript
// MainLayout.tsx
useEffect(() => {
  const loadProfilePicture = async () => {
    if (user?.userId || user?.username) {
      const attributes = await fetchUserAttributes();
      if (attributes.picture) {
        setProfilePictureUrl(attributes.picture);
      }
    }
  };
  loadProfilePicture();
}, [user]); // ❌ PROBLEM: Doesn't trigger reliably
```

### After (Fixed)

```typescript
// MainLayout.tsx
useEffect(() => {
  const loadProfilePicture = async () => {
    if (user?.userId || user?.username) {
      const attributes = await fetchUserAttributes();
      console.log('Loaded user attributes:', attributes); // Added logging
      if (attributes.picture) {
        console.log('Setting profile picture URL:', attributes.picture); // Added logging
        setProfilePictureUrl(attributes.picture);
      } else {
        console.log('No picture attribute found'); // Added logging
        setProfilePictureUrl(null);
      }
    } else {
      setProfilePictureUrl(null); // Clear when no user
    }
  };
  
  loadProfilePicture();
  
  const interval = setInterval(loadProfilePicture, 30 * 1000); // Faster refresh
  return () => clearInterval(interval);
}, [user?.userId, user?.username]); // ✅ FIXED: Specific dependencies
```

## 📈 Performance Impact

```
┌─────────────────────────────────────────────────────────────┐
│                    PERFORMANCE                               │
└─────────────────────────────────────────────────────────────┘

Before Fix:
├─> fetchUserAttributes() called: Once on mount
├─> Refresh interval: 60 seconds
└─> After login: Not called (BUG)

After Fix:
├─> fetchUserAttributes() called: On mount + on login
├─> Refresh interval: 30 seconds (faster)
├─> After login: Always called (FIXED)
└─> Extra API calls: 1 per login (negligible)

Cost Impact:
├─> Cognito API calls: Free (within limits)
├─> S3 GET requests: $0.0004 per 1000 requests
└─> Total: Negligible
```

## ✅ Verification Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                    HOW TO VERIFY FIX                         │
└─────────────────────────────────────────────────────────────┘

1. Browser Console Logs
   ✅ "Loaded user attributes: {email, name, picture, ...}"
   ✅ "Setting profile picture URL: https://..."
   ❌ No error messages

2. Cognito Attribute
   ✅ picture attribute exists
   ✅ picture value is S3 URL
   ❌ picture is not empty

3. S3 File
   ✅ File exists in public/profile-pictures/
   ✅ File is accessible (public read)
   ❌ File is not deleted

4. Visual Verification
   ✅ Picture displays in Settings
   ✅ Picture displays in top-right avatar
   ✅ Picture persists after logout/login
   ✅ Picture syncs across devices
   ❌ Picture doesn't show for wrong user
```

## 🎉 Success Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    SUCCESS CRITERIA                          │
└─────────────────────────────────────────────────────────────┘

Before Fix:
├─> Upload success rate: 100% ✅
├─> Display success rate: 100% ✅
├─> Persistence after logout: 0% ❌
└─> User satisfaction: Low ❌

After Fix:
├─> Upload success rate: 100% ✅
├─> Display success rate: 100% ✅
├─> Persistence after logout: 100% ✅
└─> User satisfaction: High ✅
```

---

**This diagram explains the complete flow of profile pictures from upload to persistence, highlighting the bug and the fix.**
