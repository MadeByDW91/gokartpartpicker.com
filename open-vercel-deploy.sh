#!/bin/bash
# Open Vercel deployment page

PROJECT_NAME="gokartpartpicker.com"
echo "🚀 Opening Vercel deployment page..."
echo ""
echo "Your project: $PROJECT_NAME"
echo ""
echo "If the browser doesn't open automatically, go to:"
echo "https://vercel.com/dashboard"
echo ""
echo "Then:"
echo "1. Find your project: $PROJECT_NAME"
echo "2. Click 'Deployments' tab"
echo "3. Click '⋯' on latest deployment"
echo "4. Click 'Redeploy'"
echo ""

# Try to open in browser (macOS)
if command -v open &> /dev/null; then
    open "https://vercel.com/dashboard"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://vercel.com/dashboard"
fi
