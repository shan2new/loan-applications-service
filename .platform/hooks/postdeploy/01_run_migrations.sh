#!/bin/bash
set -euo pipefail

# Log the start of the script
echo "Running database migrations..."

# Move to the application directory
cd /var/app/current

# Check if the DATABASE_URL environment variable is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set, attempting to load from environment file"
  if [ -f ".env" ]; then
    source .env
  fi
fi

# Verify DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set, skipping migrations"
  exit 1
fi

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Database migrations completed"
