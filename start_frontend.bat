@echo off
REM Restart Frontend Development Server
echo.
echo ============================================================
echo Stopping existing Node processes...
echo ============================================================
taskkill /F /IM node.exe 2>nul
timeout /t 2

echo.
echo ============================================================
echo Starting frontend dev server...
echo ============================================================
cd /d "d:\Data Stroyteller\frontend"
npm run dev

pause
