# Upload 03 - Seed Data and Cross-Platform Startup

Adds seed data tooling and replaces Windows-only one-click startup with normal backend/frontend commands for Windows and macOS teammates.

## Main changes
- Adds seed_user_expenses.py to regenerate 100 expenses per user.
- README explains manual backend and frontend startup.
- Windows-only batch startup files are removed from this simulated upload.

## Run
Backend: cd expense-tracker-backend; python -m venv .venv; activate it; python -m pip install -r requirements.txt; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
Frontend: cd expense-tracker-react; npm install; npm run dev -- --host 0.0.0.0

Generated on 2026-05-16 12:16:34.
