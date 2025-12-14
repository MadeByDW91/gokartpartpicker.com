#!/bin/bash
# Deployment script for GoKartPartPicker

echo "🚀 Deploying GoKartPartPicker to production..."
echo ""

# Check if we have a remote
if ! git remote get-url origin &>/dev/null; then
    echo "❌ No Git remote configured."
    echo ""
    echo "To set up auto-deploy:"
    echo "1. Create a repository on GitHub (github.com/new)"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/gokartpartpicker.git"
    echo "3. Run: git push -u origin add-vercel"
    echo ""
    echo "Or deploy manually via Vercel dashboard:"
    echo "https://vercel.com/dashboard"
    exit 1
fi

# Push to trigger Vercel deployment
echo "📤 Pushing to GitHub to trigger Vercel deployment..."
git push origin add-vercel

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed! Vercel should auto-deploy in 2-3 minutes."
    echo "Check your deployment at: https://vercel.com/dashboard"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Set upstream: git push -u origin add-vercel"
    echo "2. Or deploy manually via Vercel dashboard"
fi
