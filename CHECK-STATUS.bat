@echo off
echo ========================================
echo SmartRent - Detailed Diagnostics
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Node.js Installation
echo ------------------------
where node >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js NOT FOUND
    echo   Download from: https://nodejs.org/
    echo.
    echo ERROR: Cannot proceed without Node.js!
    pause
    exit /b 1
) else (
    node --version
    npm --version
    echo ✓ Node.js is installed
)

echo.
echo [2] Server Configuration
echo ------------------------
if exist "server\.env" (
    echo ✓ Server .env exists
    echo   Checking MongoDB URI...
    findstr /C:"MONGO_URI=" "server\.env" >nul
    if errorlevel 1 (
        echo   ✗ WARNING: No MONGO_URI found in .env
    ) else (
        echo   ✓ MONGO_URI configured
    )
) else (
    echo ✗ Server .env NOT FOUND
)

if exist "server\node_modules\express\package.json" (
    echo ✓ Server dependencies installed
) else (
    echo ✗ Server dependencies NOT installed
    echo   Run: cd server ^&^& npm install
)

echo.
echo [3] Client Configuration
echo ------------------------
if exist "client\.env" (
    echo ✓ Client .env exists
) else (
    echo ✗ Client .env NOT FOUND
)

if exist "client\node_modules\vite\package.json" (
    echo ✓ Client dependencies installed
) else (
    echo ✗ Client dependencies NOT installed
    echo   Run: cd client ^&^& npm install
)

echo.
echo [4] Port Status
echo ---------------
netstat -ano | findstr ":4000" >nul
if %errorlevel% equ 0 (
    echo ✓ Port 4000 IN USE (Backend running)
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000"') do (
        echo   Process ID: %%a
    )
) else (
    echo ✗ Port 4000 FREE (Backend NOT running)
)

netstat -ano | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo ✓ Port 5173 IN USE (Frontend running)
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
        echo   Process ID: %%a
    )
) else (
    echo ✗ Port 5173 FREE (Frontend NOT running)
)

echo.
echo [5] Test Server Startup
echo -----------------------
echo Testing if server can start...
cd server
echo Starting server test (10 seconds)...
start /min cmd /c "npm run dev > test.log 2>&1"
timeout /t 10 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1
if exist "test.log" (
    echo Server log output:
    type test.log
    del test.log
) else (
    echo No log file created
)

cd ..

echo.
echo ========================================
echo RECOMMENDATIONS
echo ========================================
echo.

if not exist "server\node_modules\express\package.json" (
    echo 1. Install server dependencies:
    echo    cd server ^&^& npm install
    echo.
)

if not exist "client\node_modules\vite\package.json" (
    echo 2. Install client dependencies:
    echo    cd client ^&^& npm install
    echo.
)

echo 3. Check the server window for errors
echo 4. Check the frontend window for errors
echo.
pause
