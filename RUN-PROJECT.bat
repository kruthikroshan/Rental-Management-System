@echo off
echo ========================================
echo SmartRent - Project Setup and Launch
echo ========================================
echo.

:: Change to project directory
cd /d "%~dp0"

:: Kill any existing processes on ports 4000 and 5173
echo [0/6] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Done. Ports cleared.

echo.
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed.

echo.
echo [2/6] Installing/Checking Server Dependencies...
cd server
if not exist "node_modules\" (
    echo Installing server dependencies (this may take a few minutes)...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install server dependencies
        echo Try running: cd server && npm install
        pause
        exit /b 1
    )
) else (
    echo Server dependencies already installed.
)

echo.
echo [3/6] Installing/Checking Client Dependencies...
cd ..\client
if not exist "node_modules\" (
    echo Installing client dependencies (this may take a few minutes)...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install client dependencies
        echo Try running: cd client && npm install
        pause
        exit /b 1
    )
) else (
    echo Client dependencies already installed.
)

echo.
echo [4/6] Verifying Environment Configuration...
cd ..\server
if not exist ".env" (
    echo WARNING: Server .env file not found!
    echo Copying from .env.example...
    copy .env.example .env >nul
    echo.
    echo IMPORTANT: Edit server\.env with your database credentials!
    pause
) else (
    echo Server environment file found.
)

cd ..\client
if not exist ".env" (
    echo Creating client .env file...
    (
        echo VITE_API_URL=http://localhost:4000
        echo VITE_GOOGLE_CLIENT_ID=774535038028-lrsne7om76o144da7inf8efjv2iar941.apps.googleusercontent.com
    ) > .env
    echo Client .env created.
) else (
    echo Client environment file found.
)

echo.
echo [5/6] Starting Backend Server...
cd ..\server
start "SmartRent Backend - PORT 4000" cmd /k "echo Starting backend... && npm run dev"
echo Backend starting on port 4000...
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [6/6] Starting Frontend...
cd ..\client
start "SmartRent Frontend - PORT 5173" cmd /k "echo Starting frontend... && npm run dev"
echo Frontend starting on port 5173...

echo.
echo ========================================
echo SmartRent is starting!
echo ========================================
echo.
echo IMPORTANT: Watch the two terminal windows that opened:
echo.
echo 1. BACKEND window should show: "Server running on port 4000"
echo 2. FRONTEND window should show: "Local: http://localhost:5173/"
echo.
echo Wait until you see BOTH messages before opening browser!
echo This usually takes 15-30 seconds for first launch.
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Admin Login:
echo   Email:    admin@smartrent.com
echo   Password: admin123
echo.
echo Opening smart loading page in browser...
echo This page will automatically detect when servers are ready.
timeout /t 2 /nobreak >nul
start "" "%~dp0loading.html"
echo.
echo If page doesn't load:
echo   1. Check both terminal windows for errors
echo   2. Wait a bit longer and refresh the page
echo   3. Run CHECK-STATUS.bat to diagnose issues
echo.
pause
