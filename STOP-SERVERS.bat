@echo off
echo ========================================
echo SmartRent - Kill Running Servers
echo ========================================
echo.

echo Checking for running servers...

:: Kill processes on port 4000 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000"') do (
    echo Killing backend process (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

:: Kill processes on port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    echo Killing frontend process (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo All servers stopped.
timeout /t 2 /nobreak >nul
