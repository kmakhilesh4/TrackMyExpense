# Profile & Settings Improvements

## Implemented Features

### 1. ✅ Profile Picture Upload
- Users can now upload profile pictures
- Click the camera icon on the avatar in Settings page
- Images are stored in S3 with private access level
- Supports all image formats (max 5MB)
- Profile pictures are displayed in Settings and top-right avatar

### 2. ✅ Password Change
- New "Change Password" button in Security section
- Requires current password for verification
- Password validation (min 8 chars, uppercase, lowercase, number, symbol)
- Confirmation field to prevent typos

### 3. ✅ Profile Editing
- "Edit Profile" button to update user information
- Currently supports Name editing
- Email is read-only (Cognito limitation)
- Clean dialog interface

### 4. ✅ Budget Feature Hidden
- Budget menu item removed from sidebar
- Budget route commented out (can be re-enabled later)
- Budget page still exists for future use

### 5. ✅ Session Extended to 8 Hours
- Access token validity: 8 hours (was 1 hour)
- ID token validity: 8 hours (was 1 hour)
- Refresh token: 30 days (unchanged)
- Users stay logged in longer without re-authentication

### 6. ✅ Profile Navigation
- Clicking avatar in top-right now navigates to Settings/Profile page
- Quick access to profile management

## Configuration Changes

### Frontend Changes
1. **Settings Page** (`frontend/src/pages/Settings.tsx`)
   - Complete rewrite with new features
   - Profile picture upload with S3 integration
   - Password change dialog
   - Profile edit dialog
   - Enhanced UI with better UX

2. **App.tsx**
   - Budget route commented out
   - Budget import commented out

3. **MainLayout.tsx**
   - Budget menu item commented out
   - Avatar click handler added to navigate to settings

4. **main.tsx**
   - Added S3 Storage configuration for Amplify
   - Configured bucket and region

5. **.env.example**
   - Updated S3 bucket variable name to `VITE_S3_RECEIPTS_BUCKET`

### Infrastructure Changes
1. **auth.yaml** (Cognito Configuration)
   - Added `picture` attribute to user schema
   - Extended token validity to 8 hours
   - Added `picture` to read/write attributes

## Required Actions

### 1. Update Cognito User Pool
You need to redeploy the auth stack to apply the 8-hour session and picture attribute:

```bash
# Navigate to infrastructure directory
cd infrastructure

# Deploy auth stack (dev)
aws cloudformation deploy \
  --template-file templates/auth.yaml \
  --stack-name trackmyexpense-auth-dev \
  --parameter-overrides file://parameters/dev.json \
  --capabilities CAPABILITY_IAM

# Or for production
aws cloudformation deploy \
  --template-file templates/auth.yaml \
  --stack-name trackmyexpense-auth-prod \
  --parameter-overrides file://parameters/prod.json \
  --capabilities CAPABILITY_IAM
```

**Note**: Updating Cognito attributes on existing user pools may require careful handling. The `picture` attribute is a standard attribute and should be safe to add.

### 2. Update Frontend Environment Variables
Update your `.env` and `.env.prod` files:

```bash
# Add/Update in frontend/.env and frontend/.env.prod
VITE_S3_RECEIPTS_BUCKET=trackmyexpense-receipts-prod-741846356523
VITE_AWS_REGION=ap-south-1
```

### 3. Configure S3 Bucket CORS
Ensure your S3 bucket has proper CORS configuration for profile picture uploads:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://myexpenses.online", "https://www.myexpenses.online"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 4. Update IAM Permissions
Ensure authenticated users have S3 permissions for profile pictures. Check your Cognito Identity Pool's authenticated role has:

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

### 5. Rebuild and Deploy Frontend

```bash
cd frontend
npm install  # If needed
npm run build
```

Then deploy to S3/CloudFront as usual.

## Testing Checklist

- [ ] Profile picture upload works
- [ ] Profile picture displays correctly
- [ ] Password change works with validation
- [ ] Profile name edit works
- [ ] Budget menu item is hidden
- [ ] Avatar click navigates to settings
- [ ] Session lasts 8 hours without logout
- [ ] All existing features still work

## Future Enhancements

1. **Profile Picture Cropping**: Add image cropping before upload
2. **More Profile Fields**: Add phone number, timezone, currency preference
3. **Two-Factor Authentication**: Enable MFA setup in settings
4. **Account Deletion**: Add option to delete account
5. **Export Data**: Allow users to export their transaction data
6. **Budget Feature**: Re-enable when ready with full implementation

## Notes

- Profile pictures are stored with private access level (only accessible by the owner)
- Password changes require the current password for security
- Email cannot be changed (Cognito limitation - would require account migration)
- Session tokens are automatically refreshed by Amplify
- Budget feature can be re-enabled by uncommenting the relevant lines
