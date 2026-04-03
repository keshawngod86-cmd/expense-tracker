@echo off
setlocal
cd /d "%~dp0"

echo ======================================
echo Expense Tracker - First Time Setup
echo ======================================
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python first, then run this file again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not installed or not added to PATH.
    echo Please install Node.js first, then run this file again.
    pause
    exit /b 1
)

echo [1/4] Creating Python virtual environment if needed...
if not exist "expense-tracker-backend\.venv\Scripts\python.exe" (
    python -m venv "expense-tracker-backend\.venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create Python virtual environment.
        pause
        exit /b 1
    )
) else (
    echo Backend virtual environment already exists.
)

echo.
echo [2/4] Installing backend Python packages...
call "expense-tracker-backend\.venv\Scripts\activate"
python -m pip install --upgrade pip
pip install -r "expense-tracker-backend\requirements.txt"
if errorlevel 1 (
    echo [ERROR] Backend package installation failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Installing frontend Node packages...
cd /d "%~dp0expense-tracker-react"
npm install
if errorlevel 1 (
    echo [ERROR] Frontend package installation failed.
    pause
    exit /b 1
)
cd /d "%~dp0"

echo.
echo [4/4] Setup complete.
echo.
echo IMPORTANT:
echo 1. Make sure MySQL is running.
echo 2. Run the SQL in expense-tracker-backend\setup_database.sql
echo    or create the database manually:
echo    CREATE DATABASE expense_tracker;
echo 3. Then run start_app.bat
pause
