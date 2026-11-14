@echo off
title LUNA-HORIZON Lunar Landing Site Navigator
cd /d "%~dp0"
echo ========================================================
echo   LUNA-HORIZON: Lunar Landing Site Navigator
echo   NASA International Space Apps Challenge 2026
echo ========================================================
echo.
echo [1/2] Checking dependencies...
if not exist "node_modules\" (
    echo Installing required packages...
    call npm install
)
echo.
echo [2/2] Launching local development server on http://localhost:5173/ ...
echo Press Ctrl+C in this terminal window to stop the server.
echo.
call npm run dev
pause
