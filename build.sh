#!/bin/bash
# Build script for Render

echo "Installing backend dependencies..."
cd backend
npm install

echo "Creating database..."
node seed.js

echo "Build complete!"
