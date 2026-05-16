# Upload 01 - Original GitHub Version

Clean source copied from github upload folder. This is the before-update version used for comparison.

## Main changes
- Keeps the existing runnable project structure.
- No generated folders are included.
- Windows batch helper scripts remain because they existed in the original upload.

## Run
Backend: cd expense-tracker-backend; python -m venv .venv; activate it; python -m pip install -r requirements.txt; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
Frontend: cd expense-tracker-react; npm install; npm run dev -- --host 0.0.0.0

Generated on 2026-05-16 12:16:33.
