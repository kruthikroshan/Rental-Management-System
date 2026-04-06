@echo off
echo ========================================
echo Quick Install Dependencies
echo ========================================
echo.
cd /d "%~dp0"

echo Installing SERVER dependencies...
cd server
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Server install failed
    pause
    exit /b 1
)

echo.
echo Installing CLIENT dependencies...
cd ..\client
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Client install failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
echo You can now run RUN-PROJECT.bat
pause
