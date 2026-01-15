# Custom Domain Setup Guide - myexpenses.online

## Overview
Connect your custom domain `myexpenses.online` to your CloudFront distribution currently serving at `d37evsm35bp5r2.cloudfront.net`.

---

## Prerequisites
- ✅ Domain purchased: `myexpenses.online`
- ✅ CloudFront distribution: `d37evsm35bp5r2.cloudfront.net`
- ✅ S3 bucket: `trackmyexpense-frontend-prod-741846356523`
- ✅ AWS Account access

---

## Step 1: Request SSL/TLS Certificate (ACM)

### Important: Certificate MUST be in us-east-1 region for CloudFront!

```bash
# Switch to us-east-1 region
aws configure set region us-east-1

# Request certificate
aws acm request-certificate \
  --domain-name myexpenses.online \
  --subject-alternative-names www.myexpenses.online \
  --validation-method DNS \
  --region us-east-1
```

**Output:** You'll get a Certificate ARN like:
```
arn:aws:acm:us-east-1:741846356523:certificate/xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Save this ARN!** You'll need it later.

### Alternative: Using AWS Console
1. Go to **AWS Certificate Manager** (ACM)
2. **IMPORTANT:** Switch region to **US East (N. Virginia) us-east-1**
3. Click **Request a certificate**
4. Choose **Request a public certificate**
5. Add domain names:
   - `myexpenses.online`
   - `www.myexpenses.online`
6. Choose **DNS validation**
7. Click **Request**

---

## Step 2: Validate Domain Ownership

### Get DNS Validation Records

```bash
# Get certificate details
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:741846356523:certificate/YOUR-CERT-ID \
  --region us-east-1
```

Look for the `DomainValidationOptions` section. You'll see CNAME records like:

```
Name: _abc123def456.myexpenses.online
Value: _xyz789ghi012.acm-validations.aws.
```

### Add DNS Records to Your Domain Registrar

Go to your domain registrar (GoDaddy, Namecheap, Route53, etc.) and add:

**For myexpenses.online:**
- Type: `CNAME`
- Name: `_abc123def456` (the validation subdomain)
- Value: `_xyz789ghi012.acm-validations.aws.`
- TTL: `300` (or default)

**For www.myexpenses.online:**
- Type: `CNAME`
- Name: `_def456abc123` (the validation subdomain for www)
- Value: `_ghi012xyz789.acm-validations.aws.`
- TTL: `300` (or default)

### Wait for Validation
- Usually takes 5-30 minutes
- Check status in ACM console or:

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:741846356523:certificate/YOUR-CERT-ID \
  --region us-east-1 \
  --query 'Certificate.Status'
```

Wait until status shows: `"ISSUED"`

---

## Step 3: Update CloudFront Distribution

### Get Your CloudFront Distribution ID

```bash
# List distributions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Origins.Items[0].DomainName]' \
  --output table
```

Find the one pointing to your S3 bucket. Let's say it's: `E1234ABCD5678`

### Update Distribution with Custom Domain

```bash
# Get current config
aws cloudfront get-distribution-config \
  --id E1234ABCD5678 \
  --output json > cloudfront-config.json

# Edit the config (see below)
# Then update
aws cloudfront update-distribution \
  --id E1234ABCD5678 \
  --if-match ETAG_FROM_GET_COMMAND \
  --distribution-config file://cloudfront-config-updated.json
```

### Manual Update via AWS Console (Easier)

1. Go to **CloudFront** console
2. Select your distribution (`d37evsm35bp5r2.cloudfront.net`)
3. Click **Edit**
4. Under **Settings**:
   - **Alternate Domain Names (CNAMEs):** Add:
     - `myexpenses.online`
     - `www.myexpenses.online`
   - **Custom SSL Certificate:** Select your certificate from dropdown
   - **Supported HTTP Versions:** HTTP/2, HTTP/3
5. Click **Save changes**
6. Wait for deployment (5-15 minutes)

---

## Step 4: Configure DNS Records

### Option A: Using Route 53 (Recommended)

If your domain is in Route 53:

```bash
# Get your hosted zone ID
aws route53 list-hosted-zones

# Create A record for apex domain
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "myexpenses.online",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d37evsm35bp5r2.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Create A record for www subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.myexpenses.online",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d37evsm35bp5r2.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

**Note:** `Z2FDTNDATAQYW2` is the CloudFront hosted zone ID (always the same for all CloudFront distributions).

### Option B: Using External DNS Provider

Add these records at your domain registrar:

**For myexpenses.online (apex domain):**
- Type: `A` (if supported) or `CNAME`
- Name: `@` or leave blank
- Value: `d37evsm35bp5r2.cloudfront.net`
- TTL: `300`

**For www.myexpenses.online:**
- Type: `CNAME`
- Name: `www`
- Value: `d37evsm35bp5r2.cloudfront.net`
- TTL: `300`

**Note:** Some registrars don't support CNAME for apex domain. In that case:
- Use ALIAS record (if available)
- Or use ANAME record
- Or redirect apex to www subdomain

---

## Step 5: Update Cognito Callback URLs

Your Cognito User Pool needs to know about the new domain:

```bash
# Update Cognito User Pool Client
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-south-1_XXXXXXXXX \
  --client-id YOUR_CLIENT_ID \
  --callback-urls "https://myexpenses.online","https://www.myexpenses.online" \
  --logout-urls "https://myexpenses.online","https://www.myexpenses.online" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "openid" "email" "profile" \
  --region ap-south-1
```

### Or via AWS Console:
1. Go to **Cognito** → **User Pools**
2. Select your pool
3. Go to **App integration** → **App clients**
4. Edit your app client
5. Add to **Callback URLs:**
   - `https://myexpenses.online`
   - `https://www.myexpenses.online`
6. Add to **Sign out URLs:**
   - `https://myexpenses.online`
   - `https://www.myexpenses.online`
7. Save changes

---

## Step 6: Update Frontend Environment Variables

Update your frontend `.env.production` file:

```bash
# frontend/.env.production
VITE_API_GATEWAY_URL=https://o09zrqxjg4.execute-api.ap-south-1.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=YOUR_CLIENT_ID
VITE_COGNITO_REGION=ap-south-1
VITE_APP_URL=https://myexpenses.online
```

### Rebuild and Deploy

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://trackmyexpense-frontend-prod-741846356523/ --delete
```

### Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD5678 \
  --paths "/*"
```

---

## Step 7: Test Your Setup

### DNS Propagation Check
```bash
# Check if DNS is resolving
nslookup myexpenses.online
nslookup www.myexpenses.online

# Or use dig
dig myexpenses.online
dig www.myexpenses.online
```

### SSL Certificate Check
```bash
# Check SSL certificate
curl -I https://myexpenses.online
curl -I https://www.myexpenses.online
```

### Browser Test
1. Open `https://myexpenses.online`
2. Check for SSL padlock (secure connection)
3. Try logging in
4. Verify all features work

---

## Step 8: Redirect www to apex (Optional)

If you want `www.myexpenses.online` to redirect to `myexpenses.online`:

### Create S3 Redirect Bucket
```bash
# Create bucket for www redirect
aws s3 mb s3://www-myexpenses-online --region ap-south-1

# Configure as website redirect
aws s3 website s3://www-myexpenses-online \
  --redirect-all-requests-to "HostName=myexpenses.online,Protocol=https"
```

### Create Separate CloudFront Distribution for www
1. Create new CloudFront distribution
2. Origin: `www-myexpenses-online.s3-website.ap-south-1.amazonaws.com`
3. Alternate domain: `www.myexpenses.online`
4. Use same SSL certificate
5. Update DNS for www to point to new distribution

---

## Troubleshooting

### Issue: Certificate validation stuck
**Solution:** 
- Double-check CNAME records in DNS
- Wait 30 minutes
- Ensure no typos in record names/values

### Issue: CloudFront shows "Invalid SSL certificate"
**Solution:**
- Ensure certificate is in us-east-1 region
- Verify certificate status is "ISSUED"
- Check alternate domain names match certificate

### Issue: DNS not resolving
**Solution:**
- Wait for DNS propagation (up to 48 hours, usually 1-2 hours)
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Use different DNS server (8.8.8.8)

### Issue: Login fails with new domain
**Solution:**
- Verify Cognito callback URLs include new domain
- Check browser console for CORS errors
- Ensure API Gateway CORS allows new domain

### Issue: Mixed content warnings
**Solution:**
- Ensure all resources load via HTTPS
- Check API calls use HTTPS
- Update any hardcoded HTTP URLs

---

## Summary Checklist

- [ ] Request SSL certificate in us-east-1
- [ ] Add DNS validation records
- [ ] Wait for certificate to be issued
- [ ] Update CloudFront with custom domain and certificate
- [ ] Add DNS A/CNAME records pointing to CloudFront
- [ ] Update Cognito callback URLs
- [ ] Update frontend environment variables
- [ ] Rebuild and deploy frontend
- [ ] Invalidate CloudFront cache
- [ ] Test domain access
- [ ] Test login functionality
- [ ] Verify SSL certificate

---

## Estimated Timeline

- Certificate request: 2 minutes
- DNS validation: 5-30 minutes
- CloudFront update: 10-15 minutes
- DNS propagation: 1-2 hours (up to 48 hours)
- **Total: 1.5-3 hours** (excluding DNS propagation)

---

## Cost Implications

- **ACM Certificate:** FREE
- **CloudFront custom domain:** FREE (included)
- **Route 53 Hosted Zone:** $0.50/month (if using Route 53)
- **Route 53 Queries:** $0.40 per million queries

---

## Support Resources

- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)
- [CloudFront Custom Domains](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html)
- [Route 53 Documentation](https://docs.aws.amazon.com/route53/)

---

## Next Steps After Setup

1. Update all documentation with new domain
2. Update LinkedIn posts with new URL
3. Set up monitoring for domain
4. Configure CloudWatch alarms
5. Set up Google Analytics (optional)
6. Add domain to Google Search Console (optional)

Good luck! 🚀
