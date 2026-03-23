@echo off
REM Restart Django Backend
echo.
echo ============================================================
echo Stopping existing Django processes...
echo ============================================================
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Data Stroyteller*" 2>nul
timeout /t 2

echo.
echo ============================================================
echo Starting Django backend server...
echo ============================================================
cd /d "d:\Data Stroyteller\Backend"
python manage.py runserver 0.0.0.0:8000

pause
