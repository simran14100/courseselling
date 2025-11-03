#!/bin/bash
set -e  # Exit on error

echo "=== Starting application ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Check if server.js exists
if [ ! -f "server.js" ]; then
  echo "Error: server.js not found in $(pwd)"
  echo "Directory contents:"
  ls -la
  exit 1
fi

# Start the server
echo "Starting server..."
node server.js
