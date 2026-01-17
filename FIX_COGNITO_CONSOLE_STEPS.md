# Fix Cognito Picture Attribute - AWS Console Steps

## Problem
Error: `"A client attempted to write unauthorized attribute"`

The Cognito User Pool Client doesn't have permission to write the `picture` attribute.

## Solution - AWS Console Steps

### Step 1: Open AWS Console
1. Go to https://console.aws.amazon.com/
2. Sign in to your AWS account
3. Make sure you're in the **ap-south-1 (Mumbai)** region (check top-right corner)

### Step 2: Navigate to Cognito
1. In the search bar at the top, type **"Cognito"**
2. Click on **"Amazon Cognito"** service
3. You'll see the Cognito dashboard

### Step 3: Open Your User Pool
1. Click on **"User pools"** in the left sidebar
2. Find and click on **"TrackMyExpense-Users-prod"**
   - User Pool ID: `ap-south-1_Eq3rKzjGa`
3. You'll see the User Pool details page

### Step 4: Open App Client Settings
1. In the left sidebar, scroll down and click on **"App integration"** tab
2. Scroll down to the **"App clients and analytics"** section
3. You'll see your app client: **"TrackMyExpense-Web-Client-prod"**
4. Click on the app client name to open it

### Step 5: Edit Attribute Permissions
1. Scroll down to the **"Attribute read and write permissions"** section
2. Click the **"Edit"** button (top-right of that section)

### Step 6: Enable Picture Attribute for Writing
1. You'll see a list of attributes with checkboxes
2. Find the **"picture"** attribute in the list
3. Make sure BOTH checkboxes are checked:
   - ✅ **Read** (should already be checked)
   - ✅ **Write** (this is the one that's missing!)
4. Also verify these are checked:
   - ✅ email (Read only - cannot write)
   - ✅ name (Read + Write)
   - ✅ updated_at (Read + Write)
   - ✅ picture (Read + Write) ← **This is what we're fixing!**

### Step 7: Save Changes
1. Scroll to the bottom of the page
2. Click the **"Save changes"** button
3. Wait for the success message: "App client updated successfully"

### Step 8: Verify the Fix
1. Go back to your application: https://myexpenses.online
2. Login to your account
3. Go to Settings page
4. Try uploading a profile picture again
5. It should work now! ✅

## Visual Guide

```
AWS Console
  └─ Cognito
      └─ User pools
          └─ TrackMyExpense-Users-prod
              └─ App integration (tab)
                  └─ App clients and analytics
                      └─ TrackMyExpense-Web-Client-prod (click)
                          └─ Attribute read and write permissions
                              └─ Edit (button)
                                  └─ Check "Write" for "picture" ✅
                                      └─ Save changes
```

## Troubleshooting

### Can't Find "picture" Attribute?
If you don't see the `picture` attribute in the list:

1. Go back to the User Pool main page
2. Click on **"Sign-up experience"** tab
3. Scroll to **"Attribute verification and user account confirmation"**
4. Click **"Edit"**
5. Under **"Custom attributes"**, check if `picture` exists
6. If not, you need to add it:
   - Click **"Add custom attribute"**
   - Name: `picture`
   - Type: `String`
   - Min length: 0
   - Max length: 2048
   - Mutable: Yes
   - Click **"Save changes"**

### Still Getting Error After Enabling?
1. **Clear browser cache** and try again
2. **Logout and login** again to get fresh tokens
3. **Wait 1-2 minutes** for AWS to propagate changes
4. Check browser console for any other errors

### Alternative: Use Standard Attribute
Instead of custom `picture` attribute, you could use the standard `profile` attribute:
1. In the app client settings, enable **Write** for `profile`
2. Update your code to use `profile` instead of `picture`
3. This is a standard Cognito attribute and should work immediately

## Expected Result

After fixing:
- ✅ S3 upload succeeds (already working)
- ✅ Cognito attribute update succeeds (was failing, now fixed)
- ✅ Profile picture displays
- ✅ Picture persists after logout

## Quick Test

After making the change, test with this flow:
1. Upload a profile picture
2. Check browser console - should see:
   ```
   Profile picture uploaded successfully, URL: https://...
   Settings - Setting profile picture URL: https://...
   ```
3. No errors about "unauthorized attribute"
4. Picture displays in Settings and top-right avatar
5. Logout and login - picture still there

## Notes

- This is a **one-time fix** - once enabled, it stays enabled
- The change takes effect immediately (no deployment needed)
- All existing users will be able to update their picture attribute
- This doesn't affect any other attributes or security settings

## If Console Method Doesn't Work

Use the PowerShell script instead:
```powershell
.\fix-cognito-picture-attribute.ps1
```

Or AWS CLI:
```powershell
aws cognito-idp update-user-pool-client `
  --user-pool-id ap-south-1_Eq3rKzjGa `
  --client-id i1rnn6it5gsf08744g172ajsa `
  --region ap-south-1 `
  --read-attributes email name email_verified updated_at picture `
  --write-attributes email name updated_at picture
```

---

**Time Required:** 2-3 minutes
**Difficulty:** Easy
**Risk:** None (only enables write permission for picture attribute)
