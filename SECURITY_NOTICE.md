# Security Notice

## ⚠️ Important: AWS Credentials

**NEVER commit AWS credentials to git!**

### For Local Development:
Use AWS CLI credentials stored in `~/.aws/credentials`:
```bash
aws configure
```

### For Production:
Lambda functions automatically use IAM roles - no credentials needed!

### Environment Files:
All `.env` files are in `.gitignore` and should NEVER be committed.

---

## What's Safe to Commit:

✅ **Safe:**
- Cognito User Pool ID (public identifier)
- Cognito Client ID (public identifier)
- DynamoDB table names
- S3 bucket names
- API Gateway URLs
- AWS Region

❌ **NEVER Commit:**
- AWS Access Key ID
- AWS Secret Access Key
- JWT secrets
- Private keys
- Passwords
- API keys

---

## If Credentials Are Exposed:

1. **Immediately rotate credentials:**
   ```bash
   aws iam create-access-key --user-name YOUR_USER
   aws iam delete-access-key --access-key-id OLD_KEY --user-name YOUR_USER
   ```

2. **Check AWS CloudTrail for unauthorized access**

3. **Update all local `.env` files with new credentials**

4. **Never commit the new credentials!**

---

## GitHub Secret Scanning:

GitHub automatically scans for exposed secrets. If you see a push protection error:

1. Remove the secret from the commit
2. Use `git rebase -i` to edit history if needed
3. Force push with `git push --force-with-lease`

---

## Best Practices:

1. ✅ Use `.env` files for local development
2. ✅ Keep `.env` in `.gitignore`
3. ✅ Use IAM roles in production
4. ✅ Rotate credentials regularly
5. ✅ Use AWS Secrets Manager for sensitive data
6. ✅ Enable MFA on AWS accounts
7. ✅ Follow principle of least privilege

---

Stay secure! 🔒
