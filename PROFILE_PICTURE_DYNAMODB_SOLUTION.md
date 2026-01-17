# Profile Picture - DynamoDB Solution

## ✅ Final Solution

We've moved profile picture storage from **Cognito attributes** to **DynamoDB**. This completely avoids the Cognito null/empty attribute issues.

## 🎯 Why DynamoDB?

### Problems with Cognito Attributes:
- ❌ Can't update attributes that are null/empty
- ❌ Amplify SDK sends null values differently than console
- ❌ Complex attribute permission management
- ❌ Limited to simple string values

### Benefits of DynamoDB:
- ✅ No null/empty value issues
- ✅ More flexible data structure
- ✅ Can store metadata (upload date, file size, etc.)
- ✅ Easier to query and manage
- ✅ Better performance
- ✅ Production-ready solution

## 📊 Data Structure

Profile pictures are stored in DynamoDB with this structure:

```javascript
{
  PK: "USER#{userId}",           // Partition key
  SK: "PROFILE_PICTURE",          // Sort key
  userId: "abc-123-def-456",      // User ID
  pictureUrl: "https://...",      // Public S3 URL
  pictureKey: "public/profile-pictures/...", // S3 key
  updatedAt: "2026-01-17T12:34:56.789Z"     // Timestamp
}
```

## 🔄 How It Works

### Upload Flow:
```
1. User selects image
2. Frontend uploads to backend API
3. Backend validates image (size, type, format)
4. Backend uploads to S3
5. Backend stores URL in DynamoDB
6. Backend returns URL to frontend
7. Frontend displays picture
```

### Display Flow:
```
1. User logs in
2. Frontend calls GET /profile/picture/url
3. Backend queries DynamoDB by userId
4. Backend returns URL
5. Frontend displays picture
```

### Delete Flow:
```
1. User clicks "Remove Photo"
2. Frontend calls GET /profile/picture/url (to get key)
3. Frontend calls DELETE /profile/picture
4. Backend deletes from S3
5. Backend deletes from DynamoDB
6. Frontend clears picture
```

## 📁 Files Modified

### Backend
1. **`backend/src/functions/profile.ts`**
   - Added DynamoDB imports
   - Upload function stores URL in DynamoDB
   - Get function retrieves URL from DynamoDB
   - Delete function removes from both S3 and DynamoDB

### Frontend
2. **`frontend/src/pages/Settings.tsx`**
   - Removed Cognito attribute updates
   - Loads picture from API instead
   - Simplified upload/delete logic

3. **`frontend/src/components/layout/MainLayout.tsx`**
   - Removed Cognito attribute fetching
   - Loads picture from API instead
   - Added apiClient import

### Infrastructure
4. **`infrastructure/templates/storage.yaml`**
   - Removed public S3 upload policy (security fix)

5. **`infrastructure/templates/auth.yaml`**
   - Added `profile` to read attributes (for backward compatibility)

## 🚀 Deployment Steps

### Step 1: Deploy Backend
```bash
cd backend
npx serverless deploy --stage prod --region ap-south-1
```

**Expected Output:**
```
✔ Service deployed to stack trackmyexpense-backend-prod
endpoints:
  POST - https://YOUR_API/profile/picture
  DELETE - https://YOUR_API/profile/picture
  GET - https://YOUR_API/profile/picture/url
```

### Step 2: Build Frontend
```bash
cd frontend
npm run build
```

### Step 3: Deploy Frontend
```bash
# Still in frontend directory
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete

# Invalidate CloudFront cache (optional but recommended)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Step 4: Test
1. Go to https://myexpenses.online
2. Login to your account
3. Go to Settings page
4. Click camera icon on avatar
5. Select an image (< 5MB)
6. Upload should succeed ✅
7. Picture displays immediately
8. Logout and login - picture persists ✅

## 🧪 Testing Checklist

### Upload Tests
- [ ] Can upload JPEG image
- [ ] Can upload PNG image
- [ ] Can upload GIF image
- [ ] Can upload WebP image
- [ ] Cannot upload file > 5MB
- [ ] Cannot upload non-image file
- [ ] Picture displays in Settings
- [ ] Picture displays in top-right avatar

### Persistence Tests
- [ ] Picture persists after page refresh
- [ ] Picture persists after logout/login
- [ ] Picture syncs across devices
- [ ] Picture syncs across browsers

### Delete Tests
- [ ] Can remove picture
- [ ] Picture disappears from UI
- [ ] File deleted from S3
- [ ] Record deleted from DynamoDB

### Security Tests
- [ ] Cannot upload without authentication
- [ ] Cannot delete other user's picture
- [ ] Cannot access other user's picture URL endpoint
- [ ] S3 bucket doesn't allow public uploads

## 🔍 Verification Commands

### Check DynamoDB Record
```bash
aws dynamodb get-item \
  --table-name TrackMyExpense-prod \
  --key '{"PK":{"S":"USER#YOUR_USER_ID"},"SK":{"S":"PROFILE_PICTURE"}}' \
  --region ap-south-1
```

### Check S3 File
```bash
aws s3 ls s3://trackmyexpense-receipts-prod-741846356523/public/profile-pictures/
```

### Check Backend Logs
```bash
aws logs tail /aws/lambda/trackmyexpense-backend-prod-uploadProfilePicture --follow
```

## 📊 API Endpoints

### POST /profile/picture
Upload a profile picture.

**Request:**
```json
{
  "fileName": "avatar.jpg",
  "fileType": "image/jpeg",
  "fileData": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "public/profile-pictures/userId-timestamp.jpg",
    "url": "https://bucket.s3.region.amazonaws.com/..."
  }
}
```

### GET /profile/picture/url
Get the current user's profile picture URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.region.amazonaws.com/...",
    "key": "public/profile-pictures/userId-timestamp.jpg"
  }
}
```

**Response (No Picture):**
```json
{
  "success": true,
  "data": {
    "url": null
  }
}
```

### DELETE /profile/picture
Delete the current user's profile picture.

**Request:**
```json
{
  "key": "public/profile-pictures/userId-timestamp.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile picture deleted"
  }
}
```

## 🔒 Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **User Isolation** - Users can only access their own pictures
3. **File Validation** - Size, type, and format validation
4. **S3 Security** - No public upload access, only Lambda can write
5. **Path Validation** - Prevents path traversal attacks
6. **Audit Logging** - All operations logged to CloudWatch

## 💰 Cost Impact

### DynamoDB
- **Storage**: ~1KB per user = $0.25 per GB/month
- **Reads**: 1 read per login = ~$0.25 per million reads
- **Writes**: 1 write per upload = ~$1.25 per million writes
- **Total**: Negligible for most applications

### S3
- **Storage**: ~500KB per user = $0.023 per GB/month
- **Requests**: Minimal (handled by Lambda)
- **Total**: ~$0.01/month for 1000 users

### Lambda
- **Invocations**: 3 per upload/delete cycle
- **Duration**: ~100ms per invocation
- **Total**: Included in free tier for most usage

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Users can upload profile pictures
- ✅ Pictures display in Settings and avatar
- ✅ Pictures persist after logout/login
- ✅ Pictures sync across devices
- ✅ Users can delete their pictures
- ✅ No Cognito attribute errors
- ✅ All security validations pass

## 🐛 Troubleshooting

### Upload Fails
1. Check backend logs: `aws logs tail /aws/lambda/trackmyexpense-backend-prod-uploadProfilePicture --follow`
2. Verify file size < 5MB
3. Verify file type is image
4. Check S3 bucket permissions

### Picture Doesn't Display
1. Check browser console for errors
2. Verify API returns URL: `GET /profile/picture/url`
3. Check S3 file exists
4. Verify DynamoDB record exists

### Picture Doesn't Persist
1. Check DynamoDB record after upload
2. Verify API endpoint is being called on login
3. Check browser console logs
4. Clear browser cache and try again

## 📝 Migration Notes

If you had users with pictures stored in Cognito attributes:
1. Old pictures won't automatically migrate
2. Users will need to re-upload their pictures
3. This is acceptable since the feature is new
4. Alternatively, create a migration script to copy from Cognito to DynamoDB

## 🔗 Related Documentation

- `SECURITY_FIXES_APPLIED.md` - Security improvements
- `PROFILE_PICTURE_SECURITY_AUDIT.md` - Security audit
- `PROFILE_PICTURE_FIX_SUMMARY.md` - Bug fix details
- `S3_PROFILE_PICTURES.md` - Original implementation

---

**Status:** ✅ Production Ready
**Last Updated:** January 17, 2026
**Solution:** DynamoDB Storage (No Cognito Attributes)
