#!/bin/bash

# Exit on error
set -e

echo "Starting database migration process..."

# Navigate to application directory
cd /var/app/staging

# Load environment variables if available
if [ -f /opt/elasticbeanstalk/deployment/env ]; then
    source /opt/elasticbeanstalk/deployment/env
fi

# If AWS_SECRETS_MANAGER_ID is set, retrieve database credentials from AWS Secrets Manager
if [ ! -z "$AWS_SECRETS_MANAGER_ID" ]; then
    echo "Retrieving database credentials from AWS Secrets Manager..."

    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo "Installing jq..."
        yum install -y jq
    fi

    # Retrieve DB credentials from Secrets Manager
    DB_CREDS=$(aws secretsmanager get-secret-value \
        --secret-id "$AWS_SECRETS_MANAGER_ID" \
        --query SecretString \
        --output text)

    # Extract credentials and build connection string
    DB_USER=$(echo $DB_CREDS | jq -r '.username')
    DB_PASS=$(echo $DB_CREDS | jq -r '.password')
    DB_HOST=$(echo $DB_CREDS | jq -r '.host')
    DB_PORT=$(echo $DB_CREDS | jq -r '.port')
    DB_NAME=$(echo $DB_CREDS | jq -r '.dbname')

    # Export DATABASE_URL for Prisma
    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

    echo "Database credentials retrieved successfully."
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: Neither DATABASE_URL environment variable nor AWS_SECRETS_MANAGER_ID is set."
    echo "Please configure one of them in the Elastic Beanstalk environment properties."
    exit 1
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Database migrations completed successfully."
