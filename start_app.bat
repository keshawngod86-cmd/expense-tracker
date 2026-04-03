@echo off
setlocal
cd /d "%~dp0"

if not exist "expense-tracker-backend\.venv\Scripts\python.exe" (
    echo Backend environment not found. Running setup_project.bat first...
    call "%~dp0setup_project.bat"
)

if not exist "expense-tracker-react\node_modules" (
    echo Frontend dependencies not found. Running setup_project.bat first...
    call "%~dp0setup_project.bat"
)

start "Expense Tracker Backend" cmd /k "cd /d "%~dp0expense-tracker-backend" && call .venv\Scripts\activate && python -m uvicorn main:app --reload"
start "Expense Tracker Frontend" cmd /k "cd /d "%~dp0expense-tracker-react" && npm run dev"

echo Backend should open at http://127.0.0.1:8000
echo Frontend should open at http://localhost:5173
echo.
echo If the backend fails, check whether MySQL is running and the database exists.
pause
