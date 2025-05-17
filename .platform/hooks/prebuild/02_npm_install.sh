#!/bin/bash
set -e

# Log the start of the script
echo "Running custom npm install..."

# Ensure we have permissions
cd /var/app/staging

# Create temporary .npmrc with production settings
echo "Creating temporary .npmrc file"
cat > .npmrc << EOF
save-exact=true
package-lock=true
audit=false
fund=false
loglevel=warn
engine-strict=true
ignore-scripts=true
EOF

# Set NODE_ENV to production explicitly
export NODE_ENV=production

# Run npm install with necessary flags
echo "Installing production dependencies..."
npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Remove temporary .npmrc
rm -f .npmrc

echo "Custom npm install completed successfully"
exit 0
