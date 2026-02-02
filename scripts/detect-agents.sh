#!/bin/bash

# Quick wrapper script to run agent detection
# Usage: ./scripts/detect-agents.sh

cd "$(dirname "$0")/.." || exit 1

if [ -d "frontend" ]; then
  cd frontend
  NODE_PATH=$PWD/node_modules npx tsx ../scripts/detect-agent-work-areas.ts
else
  echo "Error: frontend directory not found"
  exit 1
fi
