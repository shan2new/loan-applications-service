#!/bin/bash
set -e

# Log the start of the script
echo "Running custom npm install..."

# Copy .npmrc with production settings
cp /var/app/staging/.npmrc /home/webapp/.npmrc

# Set NODE_ENV to production explicitly
export NODE_ENV=production

# Run npm install with necessary flags
cd /var/app/staging
npm install --omit=dev --no-audit --no-fund --ignore-scripts

echo "Custom npm install completed successfully"
exit 0
