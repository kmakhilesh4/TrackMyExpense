# TrackMyExpense Infrastructure Deployment Script (PowerShell)
# This script deploys all CloudFormation stacks for the application

param(
    [string]$Environment = "prod",
    [string]$Region = "ap-south-1"
)

if ($env:AWS_REGION) { $Region = $env:AWS_REGION }

$ErrorActionPreference = "Stop"

# Configuration
$StackPrefix = "TrackMyExpense"

Write-Host "========================================" -ForegroundColor Green
Write-Host "TrackMyExpense Infrastructure Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Environment: $Environment"
Write-Host "Region: $Region"
Write-Host ""

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI is not installed" -ForegroundColor Red
    exit 1
}

# Check if parameters file exists
$ParamsFile = "infrastructure\parameters\$Environment.json"
if (!(Test-Path $ParamsFile)) {
    Write-Host "Error: Parameters file not found: $ParamsFile" -ForegroundColor Red
    exit 1
}

# Function to deploy a stack
function Invoke-StackDeployment {
    param(
        [string]$StackName,
        [string]$TemplateFile,
        [string]$Description
    )
    
    Write-Host "Deploying $Description..." -ForegroundColor Yellow
    
    aws cloudformation deploy --template-file $TemplateFile --stack-name "$StackPrefix-$StackName-$Environment" --parameter-overrides file://$ParamsFile --capabilities CAPABILITY_IAM --region $Region --no-fail-on-empty-changeset
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "v $Description deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "x Failed to deploy $Description" -ForegroundColor Red
        exit 1
    }
}

# Function to get stack output
function Get-StackOutput {
    param(
        [string]$StackName,
        [string]$OutputKey
    )
    
    $output = aws cloudformation describe-stacks --stack-name "$StackPrefix-$StackName-$Environment" --region $Region --query "Stacks[0].Outputs[?OutputKey==`"$OutputKey`"].OutputValue" --output text 2>$null
    
    return $output
}

# Deploy stacks in order
Write-Host "Step 1: Deploying Database Stack" -ForegroundColor Green
Invoke-StackDeployment -StackName "Database" -TemplateFile "infrastructure\templates\database.yaml" -Description "DynamoDB Table"
Write-Host ""

Write-Host "Step 2: Deploying Authentication Stack" -ForegroundColor Green
Invoke-StackDeployment -StackName "Auth" -TemplateFile "infrastructure\templates\auth.yaml" -Description "Cognito User Pool"
Write-Host ""

Write-Host "Step 3: Deploying Storage Stack" -ForegroundColor Green
Invoke-StackDeployment -StackName "Storage" -TemplateFile "infrastructure\templates\storage.yaml" -Description "S3 Buckets"
Write-Host ""

# Get outputs
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Stack Outputs:" -ForegroundColor Yellow
Write-Host ""

$TableName = Get-StackOutput -StackName "Database" -OutputKey "TableName"
Write-Host "DynamoDB Table: $TableName"

$UserPoolId = Get-StackOutput -StackName "Auth" -OutputKey "UserPoolId"
$UserPoolClientId = Get-StackOutput -StackName "Auth" -OutputKey "UserPoolClientId"
Write-Host "Cognito User Pool ID: $UserPoolId"
Write-Host "Cognito Client ID: $UserPoolClientId"

$ReceiptsBucket = Get-StackOutput -StackName "Storage" -OutputKey "ReceiptsBucketName"
$FrontendBucket = Get-StackOutput -StackName "Storage" -OutputKey "FrontendBucketName"
$CloudFrontDomain = Get-StackOutput -StackName "Storage" -OutputKey "CloudFrontDomainName"
Write-Host "Receipts Bucket: $ReceiptsBucket"
Write-Host "Frontend Bucket: $FrontendBucket"
Write-Host "CloudFront URL: https://$CloudFrontDomain"

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Update backend\.env with the above values"
Write-Host "2. Update frontend\.env.local with Cognito details"
Write-Host "3. Deploy Lambda functions"
Write-Host ""
