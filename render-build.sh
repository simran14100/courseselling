#!/bin/bash
# Build script for Render.com deployment

set -e  # Exit on any error

echo "========================================="
echo "Starting Render Build Process"
echo "========================================="

# Show current directory
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Install root dependencies
echo ""
echo "Step 1: Installing root dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "Step 2: Installing frontend dependencies..."
cd frontend
npm install

# Build React app
echo ""
echo "Step 3: Building React application..."
npm run build

# Verify build
echo ""
echo "Step 4: Verifying build..."
if [ -f "build/index.html" ]; then
    echo "✓ Build successful! index.html found"
    echo "Build directory contents:"
    ls -la build/ | head -20
else
    echo "✗ Build failed! index.html not found"
    exit 1
fi

# Go back to root
cd ..

echo ""
echo "========================================="
echo "Build Complete!"
echo "========================================="

