@echo off
echo Testing Backend Connection...
echo.

REM Test 1: Check if port 3000 is listening
echo [1/3] Checking if port 3000 is listening...
netstat -ano | findstr :3000
echo.

REM Test 2: Try to connect with curl
echo [2/3] Testing API endpoint with curl...
curl -v http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"Admin123!\"}" 2>&1
echo.

REM Test 3: Check backend process
echo [3/3] Checking for node/tsx processes...
tasklist | findstr /i "node tsx"
echo.

echo.
echo ===========================
echo Test Complete
echo ===========================
pause
