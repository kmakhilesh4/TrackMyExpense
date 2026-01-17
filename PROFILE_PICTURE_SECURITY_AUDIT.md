# Profile Picture Security Audit

## 🔒 Security Analysis - Complete Review

### ✅ SECURE: Authentication & Authorization

**1. JWT Token Verification**
```typescript
// backend/src/middleware/auth.middleware.ts
- Uses AWS Cognito JWT Verifier ✅
- Validates token signature ✅
- Checks token expiration ✅
- Extracts user ID from token ✅
```

**Status:** ✅ SECURE
- All uploads require valid Cognito JWT token
- Token cannot be forged or tampered with
- Expired tokens are rejected

---

### ✅ SECURE: User Isolation

**2. User ID in Filename**
```typescript
// backend/src/functions/profile.ts
const key = `public/profile-pictures/${user.userId}-${Date.now()}.${extension}`;
```

**Status:** ✅ SECURE
- Each file includes authenticated user's ID
- Users cannot overwrite other users' files
- Timestamp prevents filename collisions

**3. Delete Authorization**
```typescript
// Verify the key belongs to this user
if (!key.includes(user.userId)) {
    return errorResponse('Unauthorized', 403);
}
```

**Status:** ✅ SECURE
- Users can only delete their own pictures
- Cannot delete other users' pictures

---

### ⚠️ VULNERABILITIES FOUND & FIXED

**4. S3 Bucket Policy - CRITICAL FIX**

**BEFORE (VULNERABLE):**
```yaml
- Sid: AllowAuthenticatedUploadProfilePictures
  Effect: Allow
  Principal: '*'  # ❌ ANYONE can upload!
  Action:
    - 's3:PutObject
    - 's3:DeleteObject
```

**AFTER (SECURE):**
```yaml
# Removed public upload policy
# Only Lambda with IAM role can upload ✅
```

**Status:** ✅ FIXED
- Removed public upload access
- Only Lambda function can upload (via IAM role)
- Public can only READ pictures

---

### ⚠️ ADDITIONAL VULNERABILITIES TO FIX

**5. File Size Validation - MISSING**

**Current Code:**
```typescript
const buffer = Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
// No size check! ❌
```

**Risk:** 
- Attacker could upload huge files (100MB+)
- Could exhaust Lambda memory (512MB limit)
- Could cause high S3 storage costs
- Could cause Lambda timeout

**Fix Needed:**
```typescript
// Add size validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
if (buffer.length > MAX_FILE_SIZE) {
    return errorResponse('File size exceeds 5MB limit', 400);
}
```

---

**6. File Type Validation - WEAK**

**Current Code:**
```typescript
if (!fileName || !fileType || !fileData) {
    return errorResponse('Missing required fields', 400);
}
// No validation of fileType content! ❌
```

**Risk:**
- Attacker could upload malicious files (exe, php, js)
- Could upload non-image files
- MIME type is user-provided (not verified)

**Fix Needed:**
```typescript
// Validate file type
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!ALLOWED_TYPES.includes(fileType)) {
    return errorResponse('Invalid file type. Only images allowed.', 400);
}

// Validate base64 data starts with image signature
if (!fileData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
    return errorResponse('Invalid image data', 400);
}
```

---

**7. Filename Extension Validation - WEAK**

**Current Code:**
```typescript
const key = `public/profile-pictures/${user.userId}-${Date.now()}.${fileName.split('.').pop()}`;
// Uses user-provided extension! ❌
```

**Risk:**
- User could provide malicious extension (.exe, .php)
- Extension doesn't match actual file type
- Could bypass security filters

**Fix Needed:**
```typescript
// Derive extension from validated MIME type
const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
};
const extension = extensionMap[fileType] || 'jpg';
const key = `public/profile-pictures/${user.userId}-${Date.now()}.${extension}`;
```

---

**8. Rate Limiting - MISSING**

**Current Code:**
```typescript
// No rate limiting! ❌
```

**Risk:**
- Attacker could spam uploads
- Could fill S3 bucket
- Could cause high costs
- Could cause DoS

**Fix Needed:**
- Add DynamoDB table to track upload count per user
- Limit to 10 uploads per hour per user
- Or use API Gateway rate limiting

---

**9. Old File Cleanup - MISSING**

**Current Code:**
```typescript
// Uploads new file but doesn't delete old one! ❌
```

**Risk:**
- Each upload creates new file
- Old files accumulate in S3
- Wasted storage costs
- User could have 100+ old pictures

**Fix Needed:**
```typescript
// Before uploading new picture:
// 1. Get current picture URL from Cognito
// 2. Extract old key from URL
// 3. Delete old file from S3
// 4. Upload new file
```

---

**10. Content-Type Header Validation - MISSING**

**Current Code:**
```typescript
await s3Client.send(new PutObjectCommand({
    ContentType: fileType, // User-provided! ❌
}));
```

**Risk:**
- User could set wrong Content-Type
- Browser might misinterpret file
- Could enable XSS attacks

**Fix Needed:**
```typescript
// Use validated MIME type, not user input
ContentType: ALLOWED_TYPES.includes(fileType) ? fileType : 'image/jpeg',
```

---

**11. Path Traversal - PROTECTED**

**Current Code:**
```typescript
const key = `public/profile-pictures/${user.userId}-${Date.now()}.${extension}`;
```

**Status:** ✅ SECURE
- No user input in path
- userId from authenticated token
- Cannot escape directory

---

**12. SQL Injection - NOT APPLICABLE**

**Status:** ✅ N/A
- No SQL queries in this function
- Uses S3 and Cognito only

---

**13. XSS (Cross-Site Scripting) - LOW RISK**

**Current Code:**
```typescript
// Images are served from S3, not from app domain
```

**Status:** ✅ LOW RISK
- Images served from S3 domain
- Not served from app domain
- Browser treats as images, not HTML

**Additional Protection:**
- Add `Content-Disposition: inline` header
- Add `X-Content-Type-Options: nosniff` header

---

**14. CORS Configuration - NEEDS REVIEW**

**Current Code:**
```yaml
# serverless.yml
cors: true  # Default CORS
```

**Risk:**
- Might allow requests from any origin
- Should restrict to your domain only

**Fix Needed:**
```yaml
cors:
  origin: 'https://myexpenses.online'
  headers:
    - Content-Type
    - Authorization
  allowCredentials: true
```

---

**15. Error Message Leakage - MINOR**

**Current Code:**
```typescript
return errorResponse(error.message || 'Failed to upload profile picture', 500);
```

**Risk:**
- Might leak internal error details
- Could help attacker understand system

**Fix Needed:**
```typescript
// Log detailed error, return generic message
console.error('Upload error:', error);
return errorResponse('Failed to upload profile picture', 500);
```

---

## 🎯 Priority Fixes Required

### CRITICAL (Fix Immediately)
1. ✅ **S3 Bucket Policy** - FIXED (removed public upload)

### HIGH (Fix Before Production)
2. ⚠️ **File Size Validation** - Add 5MB limit
3. ⚠️ **File Type Validation** - Validate MIME type strictly
4. ⚠️ **Old File Cleanup** - Delete old picture on new upload

### MEDIUM (Fix Soon)
5. ⚠️ **Rate Limiting** - Prevent spam uploads
6. ⚠️ **Extension Validation** - Derive from MIME type
7. ⚠️ **CORS Configuration** - Restrict to your domain

### LOW (Nice to Have)
8. ⚠️ **Error Message Sanitization** - Don't leak details
9. ⚠️ **Content Security Headers** - Add security headers

---

## 🔧 Recommended Security Enhancements

### 1. Image Processing
```typescript
// Use Sharp library to:
- Validate it's actually an image
- Resize to max 500x500px
- Strip EXIF data (privacy)
- Convert to WebP (smaller size)
- Re-encode (removes malicious payloads)
```

### 2. Virus Scanning
```typescript
// Use AWS Lambda with ClamAV to:
- Scan uploaded files for malware
- Quarantine suspicious files
- Alert on threats
```

### 3. CloudFront CDN
```typescript
// Serve images through CloudFront:
- Faster delivery
- DDoS protection
- Geographic restrictions
- Signed URLs for private access
```

### 4. Audit Logging
```typescript
// Log all upload/delete operations:
- User ID
- Timestamp
- File size
- IP address
- User agent
```

---

## 📊 Security Score

| Category | Score | Status |
|----------|-------|--------|
| Authentication | 10/10 | ✅ Excellent |
| Authorization | 9/10 | ✅ Good |
| Input Validation | 4/10 | ⚠️ Needs Work |
| Rate Limiting | 0/10 | ❌ Missing |
| File Handling | 5/10 | ⚠️ Needs Work |
| Error Handling | 7/10 | ✅ Good |
| Infrastructure | 8/10 | ✅ Good |

**Overall Score: 6.1/10** - Needs improvement before production

---

## ✅ Action Items

### Immediate (Before Next Deploy)
- [x] Remove public S3 upload policy
- [ ] Add file size validation (5MB)
- [ ] Add strict MIME type validation
- [ ] Add old file cleanup logic

### Short Term (This Week)
- [ ] Add rate limiting
- [ ] Fix extension validation
- [ ] Configure CORS properly
- [ ] Add security headers

### Long Term (Next Sprint)
- [ ] Add image processing (resize, validate)
- [ ] Add virus scanning
- [ ] Set up CloudFront CDN
- [ ] Add audit logging

---

## 🔗 References

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [AWS Lambda Security Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html)

---

**Last Updated:** January 17, 2026
**Audited By:** Kiro AI Assistant
**Next Review:** Before production deployment
