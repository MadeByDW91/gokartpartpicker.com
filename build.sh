#!/bin/bash
set -e

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Install dependencies
npm ci

# Build
npm run build
