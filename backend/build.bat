@echo off

:: Navigate to the frontend directory
cd ../frontend

:: Run the build command synchronously
echo Building frontend...
call npm run build

:: Check if the build was successful
if %errorlevel% neq 0 (
    echo Frontend build failed. Please check the errors above.
    exit /b %errorlevel%
)

echo Frontend build successful.

:: Navigate to the backend directory
cd ../backend

:: Start the server
node server.js
