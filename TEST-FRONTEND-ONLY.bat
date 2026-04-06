@echo off
echo ========================================
echo Manual Server Test - FRONTEND ONLY
echo ========================================
echo.
echo This will start ONLY the frontend server
echo so you can see any error messages clearly.
echo.
echo Press Ctrl+C to stop the server when done.
echo.
pause

cd /d "%~dp0client"

echo.
echo Checking dependencies...
if not exist "node_modules\vite\package.json" (
    echo Dependencies not found. Installing...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting frontend server...
echo Look for: "Local: http://localhost:5173/"
echo.
echo ========================================
npm run dev
