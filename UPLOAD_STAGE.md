# Upload 06 - Final Bubble Bill Release

Exact cleaned final source snapshot prepared for upload, excluding generated folders and local-only dependency/build output.

## Main changes
- Matches the current final project source.
- Includes backend, frontend, README, logo assets, seed script, and database setup.
- Excludes .git, node_modules, dist, virtual environments, and Python cache files.

## Run
Backend: cd expense-tracker-backend; python -m venv .venv; activate it; python -m pip install -r requirements.txt; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
Frontend: cd expense-tracker-react; npm install; npm run dev -- --host 0.0.0.0

Generated on 2026-05-16 12:16:35.
