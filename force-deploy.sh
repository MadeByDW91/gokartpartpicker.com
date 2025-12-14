#!/bin/bash
# Force a new deployment by making a small commit and pushing

echo "🔄 Forcing a new deployment..."

# Make sure we're on main
git checkout main

# Make a small change to trigger deployment
echo "" >> README.md
echo "<!-- Deployment trigger -->" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger deployment: Update website with logo and improvements"
git push origin main

echo ""
echo "✅ Pushed! This should trigger Vercel to deploy."
echo "Check: https://vercel.com/dashboard"
echo ""
echo "If Vercel is connected to GitHub, it will auto-deploy in 2-3 minutes."
