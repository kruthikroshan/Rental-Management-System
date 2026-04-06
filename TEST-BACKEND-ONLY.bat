@echo off
echo ========================================
echo Manual Server Test - BACKEND ONLY
echo ========================================
echo.
echo This will start ONLY the backend server
echo so you can see any error messages clearly.
echo.
echo Press Ctrl+C to stop the server when done.
echo.
pause

cd /d "%~dp0server"

echo.
echo Checking dependencies...
if not exist "node_modules\express\package.json" (
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
echo Starting backend server...
echo Look for: "API running on http://localhost:4000"
echo.
echo ========================================
npm run dev
