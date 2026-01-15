# Connect Custom Domain to CloudFront

## ✅ Prerequisites Complete
- ACM Certificate validated in us-east-1
- Domain: trackmyexpense.online
- S3 bucket with website content

---

## Step 1: Create CloudFront Distribution

### Option A: AWS Console (Recommended for first time)

1. **Go to CloudFront Console:**
   https://console.aws.amazon.com/cloudfront/v3/home

2. **Click "Create Distribution"**

3. **Origin Settings:**
   - **Origin Domain:** Select your S3 bucket OR enter: `trackmyexpense-frontend-prod-741846356523.s3-website.ap-south-1.amazonaws.com`
   - **Origin Path:** Leave empty
   - **Name:** S3-TrackMyExpense
   - **Origin Access:** Public (if using S3 website endpoint)

4. **Default Cache Behavior:**
   - **Viewer Protocol Policy:** Redirect HTTP to HTTPS
   - **Allowed HTTP Methods:** GET, HEAD, OPTIONS
   - **Cache Policy:** CachingOptimized
   - **Origin Request Policy:** CORS-S3Origin (or create custom)

5. **Settings:**
   - **Price Class:** Use All Edge Locations (or choose based on budget)
   - **Alternate Domain Names (CNAMEs):** 
     ```
     trackmyexpense.online
     www.trackmyexpense.online
     ```
   - **Custom SSL Certificate:** Select your ACM certificate
   - **Supported HTTP Versions:** HTTP/2, HTTP/3
   - **Default Root Object:** `index.html`
   - **Standard Logging:** Off (or enable if you want logs)

6. **Error Pages (Important for React Router):**
   After creating, go to "Error Pages" tab and add:
   - **HTTP Error Code:** 403
   - **Response Page Path:** `/index.html`
   - **HTTP Response Code:** 200
   - **TTL:** 300
   
   Repeat for:
   - **HTTP Error Code:** 404
   - **Response Page Path:** `/index.html`
   - **HTTP Response Code:** 200
   - **TTL:** 300

7. **Click "Create Distribution"**

---

## Step 2: Update DNS Records

Once CloudFront distribution is created (Status: Deployed), you'll get a domain like: `d1234567890.cloudfront.net`

### Update Namecheap DNS:

1. **Go to Namecheap Dashboard**
2. **Manage Domain → Advanced DNS**
3. **Delete or Update existing A records**
4. **Add new CNAME records:**

```
Type    Host    Value                           TTL
CNAME   @       d1234567890.cloudfront.net      Automatic
CNAME   www     d1234567890.cloudfront.net      Automatic
```

**Note:** Replace `d1234567890.cloudfront.net` with your actual CloudFront domain!

**Important:** Some DNS providers don't allow CNAME for root domain (@). If Namecheap doesn't allow it:
- Use ALIAS record if available
- Or use URL Redirect from @ to www
- Or use Namecheap's ParkingPage feature

---

## Step 3: Test Your Setup

### Wait for DNS Propagation (5-30 minutes)

```bash
# Check DNS propagation
nslookup trackmyexpense.online

# Check if CloudFront is responding
curl -I https://trackmyexpense.online
```

### Expected Result:
```
HTTP/2 200
server: CloudFront
x-cache: Hit from cloudfront
```

---

## Step 4: Update Frontend Environment

Update `frontend/.env.production`:

```env
# Use your custom domain
VITE_APP_URL=https://trackmyexpense.online

# Keep API URL as is
VITE_API_BASE_URL=https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod
VITE_API_GATEWAY_URL=https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod
```

Rebuild and redeploy:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523 --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## Step 5: Update Cognito Callback URLs

1. **Go to Cognito Console:**
   https://console.aws.amazon.com/cognito/v2/home?region=ap-south-1

2. **Select your User Pool:** `TrackMyExpense-prod`

3. **App Integration → App Clients → Your App Client**

4. **Update Callback URLs:**
   ```
   https://trackmyexpense.online
   https://trackmyexpense.online/
   https://www.trackmyexpense.online
   https://www.trackmyexpense.online/
   ```

5. **Update Sign-out URLs:**
   ```
   https://trackmyexpense.online
   https://www.trackmyexpense.online
   ```

6. **Update Allowed Origins (CORS):**
   ```
   https://trackmyexpense.online
   https://www.trackmyexpense.online
   ```

---

## Option B: AWS CLI (Faster)

Create a file `cloudfront-config.json`:

```json
{
  "CallerReference": "trackmyexpense-2024",
  "Aliases": {
    "Quantity": 2,
    "Items": ["trackmyexpense.online", "www.trackmyexpense.online"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-TrackMyExpense",
        "DomainName": "trackmyexpense-frontend-prod-741846356523.s3-website.ap-south-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-TrackMyExpense",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 3,
      "Items": ["GET", "HEAD", "OPTIONS"]
    },
    "Compress": true,
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:741846356523:certificate/YOUR_CERT_ID",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Enabled": true
}
```

Deploy:
```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

---

## Troubleshooting

### Issue: "CNAMEAlreadyExists"
**Solution:** The domain is already associated with another CloudFront distribution. Delete the old one first.

### Issue: Certificate not showing in dropdown
**Solution:** Make sure certificate is in us-east-1 region and status is "Issued"

### Issue: 403 Forbidden
**Solution:** 
- Check S3 bucket policy allows CloudFront
- Verify Origin settings use S3 website endpoint (not REST endpoint)

### Issue: React Router not working (404 on refresh)
**Solution:** Add custom error responses (403 and 404 → /index.html)

### Issue: DNS not resolving
**Solution:** 
- Wait 5-30 minutes for DNS propagation
- Check if CNAME records are correct
- Use `dig trackmyexpense.online` to verify

---

## Verification Checklist

After setup:
- [ ] https://trackmyexpense.online loads
- [ ] https://www.trackmyexpense.online loads
- [ ] SSL certificate is valid (green padlock)
- [ ] Login works
- [ ] React Router works (refresh on /accounts works)
- [ ] CloudFront cache is working (check X-Cache header)

---

## Cost Optimization

### CloudFront Pricing:
- First 10 TB/month: $0.085/GB
- HTTPS requests: $0.01 per 10,000 requests
- Estimated cost for low traffic: $1-5/month

### To Reduce Costs:
1. Use "Use Only North America and Europe" price class
2. Enable compression
3. Set appropriate cache TTLs
4. Use CloudFront Functions instead of Lambda@Edge

---

## Next Steps

1. Create CloudFront distribution
2. Update DNS records
3. Wait for propagation
4. Update Cognito URLs
5. Test thoroughly
6. Celebrate! 🎉

Your app will be live at https://trackmyexpense.online!
