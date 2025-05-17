#!/bin/bash
set -euo pipefail

# Log file path
LOG_FILE="/var/log/eb-diagnostics.log"

# Function to log messages
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "Starting deployment diagnostics..."
log "===================================="

# Check if the application directory exists
log "Checking application directory..."
if [ -d "/var/app/current" ]; then
  log "Application directory exists: $(ls -la /var/app/current | wc -l) files"
else
  log "ERROR: Application directory does not exist"
fi

# Check dist directory (compiled files)
log "Checking dist directory..."
if [ -d "/var/app/current/dist" ]; then
  log "Dist directory exists: $(ls -la /var/app/current/dist | wc -l) files"
else
  log "ERROR: Dist directory does not exist"
fi

# Check main entry point
log "Checking entry point..."
if [ -f "/var/app/current/dist/index.js" ]; then
  log "Entry point exists"
else
  log "ERROR: Entry point does not exist"
fi

# Check for environment file
log "Checking .env file..."
if [ -f "/var/app/current/.env" ]; then
  log ".env file exists with $(grep -v '^#' /var/app/current/.env | grep -v '^$' | wc -l) variables"
  # List environment variable names only (not values for security)
  log "Environment variables: $(grep -v '^#' /var/app/current/.env | grep -v '^$' | cut -d= -f1 | tr '\n' ' ')"
else
  log "ERROR: .env file does not exist"
fi

# Check network connectivity to the database
log "Checking database connectivity..."
DB_HOST=$(grep 'DATABASE_URL' /var/app/current/.env 2>/dev/null | grep -oP '@\K[^:]+' || echo "unknown")
if [ "$DB_HOST" != "unknown" ]; then
  log "Testing connectivity to database host: $DB_HOST"
  if ping -c 2 "$DB_HOST" &>/dev/null; then
    log "Network connectivity to database host is OK"
  else
    log "ERROR: Cannot reach database host"
  fi
else
  log "Could not determine database host from DATABASE_URL"
fi

# Check current memory usage
log "Memory usage:"
free -h | tee -a "$LOG_FILE"

# Check disk usage
log "Disk usage:"
df -h | tee -a "$LOG_FILE"

# Check current processes
log "Current Node.js processes:"
ps aux | grep node | tee -a "$LOG_FILE"

# Check if the app is listening on the expected port
PORT=${PORT:-8080}
log "Checking if application is listening on port $PORT..."
if netstat -tulpn 2>/dev/null | grep ":$PORT" &>/dev/null; then
  log "Application is listening on port $PORT"
else
  log "ERROR: No application is listening on port $PORT"
fi

# Check recent logs
log "Last 20 lines of application log:"
if [ -f "/var/log/nodejs/nodejs.log" ]; then
  tail -20 /var/log/nodejs/nodejs.log | tee -a "$LOG_FILE"
else
  log "No application log file found"
fi

log "Diagnostics completed"
log "===================================="
