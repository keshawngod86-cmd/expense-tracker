# Upload 04 - Admin Per-User Activity UI

Improves the admin screen so user records and activity are shown per selected user instead of mixing every user into one crowded activity area.

## Main changes
- Admin user list keeps search and selection.
- Selected user detail shows profile fields without password data.
- Added Information and Activity sections are separated.
- Mobile admin layout receives the final compact rounded Bubble Bill styling.

## Run
Backend: cd expense-tracker-backend; python -m venv .venv; activate it; python -m pip install -r requirements.txt; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
Frontend: cd expense-tracker-react; npm install; npm run dev -- --host 0.0.0.0

Generated on 2026-05-16 12:16:35.
