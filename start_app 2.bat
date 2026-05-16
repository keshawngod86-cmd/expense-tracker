@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "expense-tracker-backend\.venv\Scripts\python.exe" (
    echo Backend environment not found. Running setup_project.bat first...
    call "%~dp0setup_project.bat"
    if errorlevel 1 exit /b 1
)

if not exist "expense-tracker-react\node_modules" (
    echo Frontend dependencies not found. Running setup_project.bat first...
    call "%~dp0setup_project.bat"
    if errorlevel 1 exit /b 1
)

start "Expense Tracker Backend" "%~dp0start_backend.bat"
start "Expense Tracker Frontend" "%~dp0start_frontend.bat"

echo Backend should open at http://127.0.0.1:8000
echo Frontend should open at http://localhost:5173
echo.
echo If the backend fails, check whether MySQL is running and the database exists.
pause
