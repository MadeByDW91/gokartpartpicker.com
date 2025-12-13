#!/bin/bash

# Migration script for GoKart Part Picker
# Usage: ./run-migrations.sh "your-database-url"

if [ -z "$1" ]; then
  echo "❌ Error: Database URL required"
  echo ""
  echo "Usage: ./run-migrations.sh \"postgresql://user:pass@host/db\""
  echo ""
  echo "Or set DATABASE_URL environment variable:"
  echo "  export DATABASE_URL=\"your-connection-string\""
  echo "  npm run db:migrate:deploy"
  echo "  npm run db:seed"
  exit 1
fi

export DATABASE_URL="$1"

echo "🚀 Running database migrations..."
npm run db:migrate:deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
  echo ""
  echo "🌱 Seeding database..."
  npm run db:seed
  
  if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
    echo ""
    echo "🎉 Your database is ready!"
  else
    echo "❌ Seeding failed. Check the error above."
    exit 1
  fi
else
  echo "❌ Migrations failed. Check the error above."
  exit 1
fi


