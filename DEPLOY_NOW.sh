#!/bin/bash
# Quick deploy script for GoKartPartPicker

echo "🚀 Deploying to Vercel Production..."
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on 'main' branch. Current: $CURRENT_BRANCH"
    echo "Switching to main..."
    git checkout main
fi

# Deploy to production
echo "📤 Deploying to production..."
npx vercel --prod --yes

echo ""
echo "✅ Deployment initiated!"
echo "Check your Vercel dashboard for status."
