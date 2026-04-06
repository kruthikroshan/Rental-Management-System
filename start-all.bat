@echo off
echo Starting SmartRent Application...
echo.
echo Opening Backend Server...
start "SmartRent Backend" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul
echo Opening Frontend...
start "SmartRent Frontend" cmd /k "cd /d %~dp0client && npm run dev"
echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo.
pause
