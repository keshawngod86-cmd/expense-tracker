@echo off
cd /d "%~dp0expense-tracker-react"

if not exist "node_modules" (
    echo Frontend dependencies not found.
    echo Please run setup_project.bat first.
    pause
    exit /b 1
)

npm run dev
pause
