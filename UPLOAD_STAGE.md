# Upload 02 - Backend MySQL User Isolation

Adds the final backend database structure, user-specific expense ownership, timestamps, admin-safe user detail APIs, and migration support.

## Main changes
- Expenses are scoped to the logged-in user.
- Admin can request a selected user expenses and activity.
- MySQL setup script now creates the user, expense, and activity tables.
- Existing tables can be migrated at backend startup.

## Run
Backend: cd expense-tracker-backend; python -m venv .venv; activate it; python -m pip install -r requirements.txt; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
Frontend: cd expense-tracker-react; npm install; npm run dev -- --host 0.0.0.0

Generated on 2026-05-16 12:16:34.
