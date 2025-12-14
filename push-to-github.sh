#!/bin/bash
# Script to push to GitHub and trigger Vercel deployment

echo "🚀 Pushing to GitHub to trigger Vercel deployment..."
echo ""

# Check if remote exists
if git remote get-url origin &>/dev/null; then
    echo "✅ Remote already configured:"
    git remote -v
    echo ""
    echo "Pushing to GitHub..."
    git push -u origin main
    echo ""
    echo "✅ Pushed! Vercel should auto-deploy in 2-3 minutes."
    echo "Check: https://vercel.com/dashboard"
else
    echo "❌ No GitHub remote configured."
    echo ""
    echo "To set it up:"
    echo "1. Create repo at: https://github.com/new"
    echo "2. Name it: gokartpartpicker"
    echo "3. Then run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/gokartpartpicker.git"
    echo "   git push -u origin main"
    echo ""
    echo "Or provide your GitHub username and I can help set it up!"
fi
