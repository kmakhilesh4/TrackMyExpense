#!/bin/bash

# TrackMyExpense Infrastructure Deployment Script
# This script deploys all CloudFormation stacks for the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${AWS_REGION:-us-east-1}
STACK_PREFIX="TrackMyExpense"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}TrackMyExpense Infrastructure Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if parameters file exists
PARAMS_FILE="infrastructure/parameters/${ENVIRONMENT}.json"
if [ ! -f "$PARAMS_FILE" ]; then
    echo -e "${RED}Error: Parameters file not found: $PARAMS_FILE${NC}"
    exit 1
fi

# Function to deploy a stack
deploy_stack() {
    local stack_name=$1
    local template_file=$2
    local description=$3
    
    echo -e "${YELLOW}Deploying $description...${NC}"
    
    aws cloudformation deploy \
        --template-file "$template_file" \
        --stack-name "${STACK_PREFIX}-${stack_name}-${ENVIRONMENT}" \
        --parameter-overrides file://"$PARAMS_FILE" \
        --capabilities CAPABILITY_IAM \
        --region "$REGION" \
        --no-fail-on-empty-changeset
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $description deployed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to deploy $description${NC}"
        exit 1
    fi
    echo ""
}

# Function to get stack output
get_stack_output() {
    local stack_name=$1
    local output_key=$2
    
    aws cloudformation describe-stacks \
        --stack-name "${STACK_PREFIX}-${stack_name}-${ENVIRONMENT}" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

# Deploy stacks in order (respecting dependencies)
echo -e "${GREEN}Step 1: Deploying Database Stack${NC}"
deploy_stack "Database" "infrastructure/templates/database.yaml" "DynamoDB Table"

echo -e "${GREEN}Step 2: Deploying Authentication Stack${NC}"
deploy_stack "Auth" "infrastructure/templates/auth.yaml" "Cognito User Pool"

echo -e "${GREEN}Step 3: Deploying Storage Stack${NC}"
deploy_stack "Storage" "infrastructure/templates/storage.yaml" "S3 Buckets"

# Get outputs
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Stack Outputs:${NC}"
echo ""

# Database outputs
TABLE_NAME=$(get_stack_output "Database" "TableName")
echo "DynamoDB Table: $TABLE_NAME"

# Auth outputs
USER_POOL_ID=$(get_stack_output "Auth" "UserPoolId")
USER_POOL_CLIENT_ID=$(get_stack_output "Auth" "UserPoolClientId")
echo "Cognito User Pool ID: $USER_POOL_ID"
echo "Cognito Client ID: $USER_POOL_CLIENT_ID"

# Storage outputs
RECEIPTS_BUCKET=$(get_stack_output "Storage" "ReceiptsBucketName")
FRONTEND_BUCKET=$(get_stack_output "Storage" "FrontendBucketName")
echo "Receipts Bucket: $RECEIPTS_BUCKET"
echo "Frontend Bucket: $FRONTEND_BUCKET"

echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Update backend/.env with the above values"
echo "2. Update frontend/.env.local with Cognito details"
echo "3. Deploy Lambda functions (coming soon)"
echo ""
