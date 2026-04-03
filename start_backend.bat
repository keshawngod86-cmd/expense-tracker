@echo off
cd /d "%~dp0expense-tracker-backend"

if not exist ".venv\Scripts\python.exe" (
    echo Backend environment not found.
    echo Please run setup_project.bat first.
    pause
    exit /b 1
)

.venv\Scripts\python.exe -m uvicorn main:app --reload
pause
