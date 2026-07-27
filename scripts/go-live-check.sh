#!/usr/bin/env bash
set -euo pipefail

echo "Kavach360 go-live quick checks"

if [ ! -f backend/.env.production ]; then
  echo "Missing backend/.env.production"
  exit 1
fi

if grep -q "CHANGE" backend/.env.production; then
  echo "backend/.env.production still contains CHANGE placeholders"
  exit 1
fi

if grep -q "DISABLE_IN_PRODUCTION" backend/.env.production; then
  echo "DEV_PASSWORD must be removed/disabled in production"
  exit 1
fi

echo "Environment file check passed"
echo "Run database backup test, SSL test, and API health check before switching DNS."
