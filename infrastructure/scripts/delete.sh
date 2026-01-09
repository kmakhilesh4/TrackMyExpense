#!/bin/bash

# TrackMyExpense Infrastructure Cleanup Script
# This script deletes all CloudFormation stacks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${AWS_REGION:-us-east-1}
STACK_PREFIX="TrackMyExpense"

echo -e "${RED}========================================${NC}"
echo -e "${RED}WARNING: Infrastructure Deletion${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo "This will delete ALL infrastructure for:"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""
read -p "Are you sure? (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Deletion cancelled"
    exit 0
fi

# Function to delete a stack
delete_stack() {
    local stack_name=$1
    local description=$2
    
    echo -e "${YELLOW}Deleting $description...${NC}"
    
    aws cloudformation delete-stack \
        --stack-name "${STACK_PREFIX}-${stack_name}-${ENVIRONMENT}" \
        --region "$REGION"
    
    aws cloudformation wait stack-delete-complete \
        --stack-name "${STACK_PREFIX}-${stack_name}-${ENVIRONMENT}" \
        --region "$REGION"
    
    echo -e "${GREEN}✓ $description deleted${NC}"
    echo ""
}

# Delete stacks in reverse order
echo -e "${YELLOW}Deleting stacks...${NC}"
delete_stack "Storage" "S3 Buckets"
delete_stack "Auth" "Cognito User Pool"
delete_stack "Database" "DynamoDB Table"

echo -e "${GREEN}All stacks deleted successfully${NC}"
