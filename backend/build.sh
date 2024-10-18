#!/bin/bash

# Navigate to the frontend directory
cd ../frontend || exit

# Run the build command synchronously
echo "Building frontend..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "Frontend build failed. Please check the errors above."
    exit 1
fi

echo "Frontend build successful."

# Navigate to the backend directory
cd ../backend || exit

# Start the server
node server.js
