#!/bin/bash
set -eo pipefail

# Log the start of the script
echo "Generating Prisma client..."

# Ensure we're in the staging directory
cd /var/app/staging

# Install Prisma CLI globally if not already installed
if ! command -v prisma &> /dev/null; then
    echo "Installing Prisma CLI..."
    npm install -g prisma
fi

# Generate Prisma client
echo "Running prisma generate..."
npx prisma generate

# Check if generation was successful
if [ -d "./node_modules/.prisma" ]; then
    echo "Prisma client generated successfully"
else
    echo "Warning: Prisma client directory not found, but continuing anyway"
fi

echo "Prisma client generation completed"
exit 0
