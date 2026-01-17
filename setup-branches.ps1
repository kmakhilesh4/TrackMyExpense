# TrackMyExpense - Branch Setup Script (PowerShell)
# This script sets up the recommended branching strategy

Write-Host "🚀 Setting up Git branching strategy for TrackMyExpense" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
try {
    git rev-parse --git-dir 2>&1 | Out-Null
} catch {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    exit 1
}

# Get current branch
$CURRENT_BRANCH = git branch --show-current
Write-Host "📍 Current branch: $CURRENT_BRANCH" -ForegroundColor Yellow
Write-Host ""

# Ensure we're on main and up to date
Write-Host "1️⃣ Ensuring main branch is up to date..." -ForegroundColor Cyan
git checkout main
git pull origin main
Write-Host "✅ Main branch updated" -ForegroundColor Green
Write-Host ""

# Create develop branch from main
Write-Host "2️⃣ Creating develop branch from main..." -ForegroundColor Cyan
$developExists = git show-ref --verify --quiet refs/heads/develop
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Develop branch already exists" -ForegroundColor Yellow
    git checkout develop
    git pull origin develop
} else {
    git checkout -b develop
    git push -u origin develop
    Write-Host "✅ Develop branch created and pushed" -ForegroundColor Green
}
Write-Host ""

# Create feature branch for current work
Write-Host "3️⃣ Creating feature branch for profile improvements..." -ForegroundColor Cyan
$FEATURE_BRANCH = "feature/profile-improvements"
$featureExists = git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Feature branch already exists" -ForegroundColor Yellow
    git checkout $FEATURE_BRANCH
} else {
    git checkout -b $FEATURE_BRANCH
    Write-Host "✅ Feature branch created: $FEATURE_BRANCH" -ForegroundColor Green
}
Write-Host ""

# Show branch structure
Write-Host "4️⃣ Current branch structure:" -ForegroundColor Cyan
git branch -a
Write-Host ""

# Instructions
Write-Host "✅ Branch setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Commit your current changes to: $FEATURE_BRANCH"
Write-Host "   git add ."
Write-Host "   git commit -m 'feat: add profile management features'"
Write-Host "   git push origin $FEATURE_BRANCH"
Write-Host ""
Write-Host "2. Create Pull Request on GitHub:"
Write-Host "   develop ← $FEATURE_BRANCH"
Write-Host ""
Write-Host "3. After PR is merged, switch to develop:"
Write-Host "   git checkout develop"
Write-Host "   git pull origin develop"
Write-Host ""
Write-Host "4. For future features, always start from develop:"
Write-Host "   git checkout develop"
Write-Host "   git checkout -b feature/your-feature-name"
Write-Host ""
Write-Host "📚 See BRANCHING_STRATEGY.md for complete workflow" -ForegroundColor Cyan
