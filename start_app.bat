@echo off
start cmd /k "cd /d %~dp0expense-tracker-backend && call .venv\Scripts\activate && python -m uvicorn main:app --reload"
start cmd /k "cd /d %~dp0expense-tracker-react && npm run dev"