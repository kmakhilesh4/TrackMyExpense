# Fix user's picture attribute if it's empty/null
# This fixes the "Attribute value for picture must not be null" error

$USER_POOL_ID = "ap-south-1_Eq3rKzjGa"
$REGION = "ap-south-1"

Write-Host "Enter your email address (the one you use to login):" -ForegroundColor Yellow
$USER_EMAIL = Read-Host

Write-Host "`nFixing picture attribute for user: $USER_EMAIL" -ForegroundColor Yellow

# Set picture attribute to 'none' (our placeholder for "no picture")
aws cognito-idp admin-update-user-attributes `
  --user-pool-id $USER_POOL_ID `
  --username $USER_EMAIL `
  --user-attributes Name=picture,Value=none `
  --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully fixed picture attribute!" -ForegroundColor Green
    Write-Host "You can now upload a profile picture." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://myexpenses.online" -ForegroundColor White
    Write-Host "2. Login with your account" -ForegroundColor White
    Write-Host "3. Go to Settings" -ForegroundColor White
    Write-Host "4. Upload a profile picture" -ForegroundColor White
    Write-Host "5. It should work now! ✅" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to update user attribute" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "- Email address is correct" -ForegroundColor White
    Write-Host "- User exists in the User Pool" -ForegroundColor White
    Write-Host "- AWS credentials are configured" -ForegroundColor White
}
