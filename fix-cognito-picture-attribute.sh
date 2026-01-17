#!/bin/bash

# Fix Cognito User Pool Client to allow writing 'picture' attribute
# Run this if CloudFormation update doesn't work

USER_POOL_ID="ap-south-1_Eq3rKzjGa"
CLIENT_ID="i1rnn6it5gsf08744g172ajsa"
REGION="ap-south-1"

echo "Updating Cognito User Pool Client to allow 'picture' attribute..."

aws cognito-idp update-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-id "$CLIENT_ID" \
  --region "$REGION" \
  --read-attributes email name email_verified updated_at picture \
  --write-attributes email name updated_at picture

if [ $? -eq 0 ]; then
    echo "✅ Successfully updated User Pool Client"
    echo "The 'picture' attribute can now be written by users"
else
    echo "❌ Failed to update User Pool Client"
    echo "Try running with --debug flag for more details"
fi
