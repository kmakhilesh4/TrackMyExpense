# TrackMyExpense Infrastructure

This directory contains CloudFormation templates and deployment scripts for the TrackMyExpense AWS infrastructure.

## Directory Structure

```
infrastructure/
├── templates/          # CloudFormation templates
│   ├── database.yaml   # DynamoDB table
│   ├── auth.yaml       # Cognito User Pool
│   └── storage.yaml    # S3 buckets
├── scripts/            # Deployment scripts
│   ├── deploy.sh       # Bash deployment script
│   ├── deploy.ps1      # PowerShell deployment script
│   └── delete.sh       # Cleanup script
└── parameters/         # Environment parameters
    ├── dev.json        # Development parameters
    └── prod.json       # Production parameters
```

## Prerequisites

- AWS CLI installed and configured
- AWS credentials with appropriate permissions
- Bash (Linux/Mac) or PowerShell (Windows)

## Deployment

### Using Bash (Linux/Mac)

```bash
# Deploy to development environment
./infrastructure/scripts/deploy.sh dev

# Deploy to production environment
./infrastructure/scripts/deploy.sh prod
```

### Using PowerShell (Windows)

```powershell
# Deploy to development environment
.\infrastructure\scripts\deploy.ps1 -Environment dev

# Deploy to production environment
.\infrastructure\scripts\deploy.ps1 -Environment prod
```

## What Gets Deployed

### 1. Database Stack
- DynamoDB table with single-table design
- Global Secondary Index (GSI1) for account queries
- Point-in-time recovery enabled
- Server-side encryption enabled

### 2. Authentication Stack
- Cognito User Pool for user management
- User Pool Client for web application
- Password policies and MFA configuration
- Email verification enabled

### 3. Storage Stack
- S3 bucket for receipt storage with lifecycle policies
- S3 bucket for frontend hosting
- CloudFront Origin Access Identity
- CORS configuration for uploads

## Stack Outputs

After deployment, the scripts will display important outputs:

- **DynamoDB Table Name**: Use in backend configuration
- **Cognito User Pool ID**: Use in backend and frontend
- **Cognito Client ID**: Use in frontend
- **S3 Bucket Names**: Use for uploads and hosting

## Environment Variables

After deployment, update your environment files:

### Backend (.env)
```
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=<from stack output>
COGNITO_USER_POOL_ID=<from stack output>
RECEIPTS_BUCKET_NAME=<from stack output>
```

### Frontend (.env.local)
```
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=<from stack output>
VITE_COGNITO_CLIENT_ID=<from stack output>
```

## Cleanup

To delete all infrastructure:

```bash
# Bash
./infrastructure/scripts/delete.sh dev

# PowerShell
# Create delete.ps1 if needed
```

⚠️ **Warning**: This will permanently delete all data!

## Cost Estimation

### Development Environment (~$5-15/month)
- DynamoDB: ~$0-5/month (on-demand)
- Cognito: Free (under 50K MAU)
- S3: ~$1-3/month
- Data Transfer: ~$1-2/month

### Production Environment (scales with usage)
- See main README for detailed cost breakdown

## Troubleshooting

### Stack Creation Failed
- Check AWS CloudFormation console for detailed error messages
- Verify your AWS credentials have necessary permissions
- Ensure parameter values are correct

### Stack Already Exists
- Use `aws cloudformation update-stack` instead of `create-stack`
- Or delete the existing stack first

### Permission Denied
- Ensure your AWS user/role has CloudFormation, DynamoDB, Cognito, and S3 permissions
- Check IAM policies

## Next Steps

1. Deploy infrastructure using the scripts above
2. Note the stack outputs
3. Update backend and frontend environment files
4. Deploy Lambda functions (see backend/README.md)
5. Deploy frontend to S3 (see frontend/README.md)
