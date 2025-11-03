#!/bin/bash
set -e  # Exit on error

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies and build
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "=== Build completed successfully ==="
echo "Directory structure after build:"
ls -la
