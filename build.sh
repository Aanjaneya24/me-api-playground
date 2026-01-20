#!/bin/bash

echo "Installing backend dependencies..."
cd backend
npm install

echo "Creating database..."
node seed.js

echo "Build complete!"
