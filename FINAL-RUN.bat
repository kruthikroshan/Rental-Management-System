@echo off
setlocal enabledelayedexpansion

echo ========================================
echo SmartRent - COMPLETE SETUP ^& RUN
echo ========================================
echo.

:: Set project directory
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: Step 0: Kill existing processes
echo [Step 0/7] Stopping any running servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
    echo   Killed process on port 4000
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
    echo   Killed process on port 5173
)
timeout /t 2 /nobreak >nul
echo   Ports cleared.

:: Step 1: Check Node.js
echo.
echo [Step 1/7] Verifying Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    echo   ❌ ERROR: Node.js is not installed!
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   ✓ Node.js %NODE_VERSION% found

:: Step 2: Install SERVER dependencies
echo.
echo [Step 2/7] Installing server dependencies...
cd "%PROJECT_DIR%server"
if not exist "node_modules\express\package.json" (
    echo   Installing... This may take 2-3 minutes.
    call npm install --legacy-peer-deps --loglevel=error
    if errorlevel 1 (
        echo   ❌ ERROR: Server install failed
        echo   Try manually: cd server ^&^& npm install
        pause
        exit /b 1
    )
    echo   ✓ Server dependencies installed
) else (
    echo   ✓ Server dependencies already installed
)

:: Step 3: Install CLIENT dependencies
echo.
echo [Step 3/7] Installing client dependencies...
cd "%PROJECT_DIR%client"
if not exist "node_modules\vite\package.json" (
    echo   Installing... This may take 2-3 minutes.
    call npm install --legacy-peer-deps --loglevel=error
    if errorlevel 1 (
        echo   ❌ ERROR: Client install failed
        echo   Try manually: cd client ^&^& npm install
        pause
        exit /b 1
    )
    echo   ✓ Client dependencies installed
) else (
    echo   ✓ Client dependencies already installed
)

:: Step 4: Check environment files
echo.
echo [Step 4/7] Checking environment configuration...
cd "%PROJECT_DIR%server"
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo   ⚠ Created .env from .env.example
        echo   ⚠ You may need to configure database settings later
    ) else (
        echo   ❌ ERROR: No .env or .env.example found
        pause
        exit /b 1
    )
) else (
    echo   ✓ Server .env exists
)

cd "%PROJECT_DIR%client"
if not exist ".env" (
    (
        echo VITE_API_URL=http://localhost:4000
        echo VITE_GOOGLE_CLIENT_ID=774535038028-lrsne7om76o144da7inf8efjv2iar941.apps.googleusercontent.com
    ) > .env
    echo   ✓ Created client .env
) else (
    echo   ✓ Client .env exists
)

:: Step 5: Start BACKEND
echo.
echo [Step 5/7] Starting BACKEND server...
cd "%PROJECT_DIR%server"
start "SmartRent BACKEND (Port 4000)" cmd /c "title SmartRent BACKEND (Port 4000) && echo ========================================= && echo    BACKEND SERVER (Port 4000) && echo ========================================= && echo. && echo Starting server... && echo. && npm run dev"
echo   ✓ Backend process started

:: Wait for backend to be ready
echo   Waiting for backend to start...
set BACKEND_READY=0
for /L %%i in (1,1,15) do (
    timeout /t 2 /nobreak >nul
    curl -s http://localhost:4000/health >nul 2>&1
    if !errorlevel! equ 0 (
        set BACKEND_READY=1
        echo   ✓ Backend is responding on port 4000
        goto :backend_ready
    )
    echo   ... checking backend (attempt %%i/15^)
)
:backend_ready

if !BACKEND_READY! equ 0 (
    echo   ⚠ Backend not responding yet (will continue anyway^)
)

:: Step 6: Start FRONTEND
echo.
echo [Step 6/7] Starting FRONTEND...
cd "%PROJECT_DIR%client"
start "SmartRent FRONTEND (Port 5173)" cmd /c "title SmartRent FRONTEND (Port 5173) && echo ========================================= && echo    FRONTEND SERVER (Port 5173) && echo ========================================= && echo. && echo Starting Vite dev server... && echo. && npm run dev"
echo   ✓ Frontend process started

:: Wait for frontend
echo   Waiting for frontend to start...
set FRONTEND_READY=0
for /L %%i in (1,1,20) do (
    timeout /t 2 /nobreak >nul
    curl -s http://localhost:5173 >nul 2>&1
    if !errorlevel! equ 0 (
        set FRONTEND_READY=1
        echo   ✓ Frontend is ready on port 5173
        goto :frontend_ready
    )
    echo   ... checking frontend (attempt %%i/20^)
)
:frontend_ready

:: Step 7: Open browser
echo.
echo [Step 7/7] Opening browser...
if !FRONTEND_READY! equ 1 (
    echo.
    echo ========================================
    echo ✓✓✓ SMARTRENT IS RUNNING! ✓✓✓
    echo ========================================
    echo.
    echo   Backend:  http://localhost:4000
    echo   Frontend: http://localhost:5173
    echo.
    echo   Admin Login:
    echo     Email:    admin@smartrent.com
    echo     Password: admin123
    echo.
    echo   Opening browser in 3 seconds...
    timeout /t 3 /nobreak >nul
    start http://localhost:5173
    echo.
    echo   ✓ Browser opened
    echo.
    echo Both servers are running in separate windows.
    echo Close this window or press any key to finish setup.
    echo To stop servers, close their windows or run STOP-SERVERS.bat
    echo.
) else (
    echo.
    echo ========================================
    echo ⚠ SERVERS STARTED BUT NOT RESPONDING
    echo ========================================
    echo.
    echo The servers have been launched but are not responding yet.
    echo.
    echo Please wait 30-60 seconds and check the server windows.
    echo Look for these messages:
    echo   BACKEND:  "API running on http://localhost:4000"
    echo   FRONTEND: "Local: http://localhost:5173/"
    echo.
    echo Once you see both messages, open: http://localhost:5173
    echo.
    echo Check the server windows for error messages.
    echo.
)

pause
