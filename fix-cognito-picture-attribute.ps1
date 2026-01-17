# Fix Cognito User Pool Client to allow writing 'picture' attribute
# Run this if CloudFormation update doesn't work

$USER_POOL_ID = "ap-south-1_Eq3rKzjGa"
$CLIENT_ID = "i1rnn6it5gsf08744g172ajsa"
$REGION = "ap-south-1"

Write-Host "Updating Cognito User Pool Client to allow 'picture' attribute..." -ForegroundColor Yellow

aws cognito-idp update-user-pool-client `
  --user-pool-id $USER_POOL_ID `
  --client-id $CLIENT_ID `
  --region $REGION `
  --read-attributes email name email_verified updated_at picture `
  --write-attributes email name updated_at picture

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully updated User Pool Client" -ForegroundColor Green
    Write-Host "The 'picture' attribute can now be written by users" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update User Pool Client" -ForegroundColor Red
    Write-Host "Try running with --debug flag for more details" -ForegroundColor Red
}
