#!/bin/bash
# This script sets up the test database for running tests

echo "Setting up test database..."

# Create test database if it doesn't exist
psql -U postgres -c "DROP DATABASE IF EXISTS loan_applications_test;"
psql -U postgres -c "CREATE DATABASE loan_applications_test;"

# Apply Prisma schema to test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/loan_applications_test?schema=public" npx prisma db push --force-reset

echo "Test database setup complete"
