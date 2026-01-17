#!/bin/bash

# TrackMyExpense - Branch Setup Script
# This script sets up the recommended branching strategy

set -e

echo "🚀 Setting up Git branching strategy for TrackMyExpense"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Ensure we're on main and up to date
echo "1️⃣ Ensuring main branch is up to date..."
git checkout main
git pull origin main
echo "✅ Main branch updated"
echo ""

# Create develop branch from main
echo "2️⃣ Creating develop branch from main..."
if git show-ref --verify --quiet refs/heads/develop; then
    echo "⚠️  Develop branch already exists"
    git checkout develop
    git pull origin develop
else
    git checkout -b develop
    git push -u origin develop
    echo "✅ Develop branch created and pushed"
fi
echo ""

# Create feature branch for current work
echo "3️⃣ Creating feature branch for profile improvements..."
FEATURE_BRANCH="feature/profile-improvements"
if git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
    echo "⚠️  Feature branch already exists"
    git checkout $FEATURE_BRANCH
else
    git checkout -b $FEATURE_BRANCH
    echo "✅ Feature branch created: $FEATURE_BRANCH"
fi
echo ""

# Show branch structure
echo "4️⃣ Current branch structure:"
git branch -a
echo ""

# Instructions
echo "✅ Branch setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Commit your current changes to: $FEATURE_BRANCH"
echo "   git add ."
echo "   git commit -m 'feat: add profile management features'"
echo "   git push origin $FEATURE_BRANCH"
echo ""
echo "2. Create Pull Request on GitHub:"
echo "   develop ← $FEATURE_BRANCH"
echo ""
echo "3. After PR is merged, switch to develop:"
echo "   git checkout develop"
echo "   git pull origin develop"
echo ""
echo "4. For future features, always start from develop:"
echo "   git checkout develop"
echo "   git checkout -b feature/your-feature-name"
echo ""
echo "📚 See BRANCHING_STRATEGY.md for complete workflow"
