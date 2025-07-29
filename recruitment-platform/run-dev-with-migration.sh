#!/bin/bash

# Navigate to backend directory
cd backend

# Run the migration
echo "Running student progress migration..."
npm run db:progress-migration

# Start the development server
echo "Starting development server..."
npm run dev 