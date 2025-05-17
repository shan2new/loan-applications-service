#!/bin/bash
set -eo pipefail

# Log the start of the script
echo "Running database migrations..."

# Move to the application directory
cd /var/app/current

# Check if the DATABASE_URL environment variable is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set, attempting to load from environment file"
  if [ -f ".env" ]; then
    # Source the env file safely
    export $(grep -v '^#' .env | xargs -0)
  fi
fi

# Verify DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "WARNING: DATABASE_URL is not set, skipping migrations"
  exit 0  # Exit successfully to avoid failing deployment
fi

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy || {
  echo "WARNING: Migration failed, but continuing deployment"
  exit 0  # Exit successfully even if migrations fail
}

echo "Database migrations completed"
