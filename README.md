# Expense Tracker

A full-stack expense tracking project built with React, FastAPI, and MySQL.

The UI has not been changed in this package. This version mainly fixes the project structure and setup scripts so it is easier to clone to a new computer and run again.

## Tech stack

- Frontend: React + Vite
- Backend: FastAPI + SQLModel
- Database: MySQL

## Project structure

```text
expense-tracker/
├── expense-tracker-backend/
│   ├── db.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── setup_database.sql
│   └── .env.example
├── expense-tracker-react/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
├── setup_project.bat
├── start_app.bat
├── start_backend.bat
├── start_frontend.bat
└── README.md
```

## What was fixed in this version

- Added `requirements.txt` for the backend
- Added a root `.gitignore`
- Added a backend `.gitignore`
- Added `setup_project.bat` for first-time setup
- Updated `start_app.bat` so it checks whether dependencies already exist
- Added `start_backend.bat` and `start_frontend.bat`
- Added `setup_database.sql`
- Cleaned editor cache and Git metadata out of the delivery package
- Kept the existing UI unchanged
- Forced setup to ignore broken local pip mirror settings
- Added fallback package sources for both Python and npm

## First-time setup on a new computer

### 1. Install software
Make sure these are installed:

- Python
- Node.js
- MySQL Server

### 2. Create the database
Open MySQL Workbench or MySQL command line and run:

```sql
CREATE DATABASE expense_tracker;
```

You can also run the file:

```text
expense-tracker-backend/setup_database.sql
```

### 3. Run setup
Double-click:

```text
setup_project.bat
```

This will:

- create `.venv` in the backend
- install Python packages from `requirements.txt`
- install frontend packages with `npm install`

### 4. Start the app
Double-click:

```text
start_app.bat
```

It should open two terminal windows:

- backend: `http://127.0.0.1:8000`
- frontend: `http://localhost:5173`

## Network note

This package now ignores any broken local pip mirror config and tries these Python sources in order:

1. `https://pypi.org/simple`
2. `https://mirrors.aliyun.com/pypi/simple/`
3. `https://pypi.tuna.tsinghua.edu.cn/simple`

It also tries these npm registries:

1. `https://registry.npmjs.org/`
2. `https://registry.npmmirror.com/`

If setup still fails after all of those, the current network itself cannot reach the package registries.

## Manual commands

### Backend
```bat
cd expense-tracker-backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt --index-url https://pypi.org/simple
.venv\Scripts\python.exe -m uvicorn main:app --reload
```

### Frontend
```bat
cd expense-tracker-react
npm install --registry=https://registry.npmjs.org/
npm run dev
```

## MySQL connection

The backend currently defaults to:

- host: `localhost`
- port: `3306`
- user: `root`
- password: `20011231`
- database: `expense_tracker`

If needed, you can change these values in `expense-tracker-backend/db.py`.

The backend also supports environment variables:

- `DATABASE_URL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

## GitHub note

This project does **not** upload `.venv` or `node_modules` to GitHub. That is normal.
On a new computer, you should run `setup_project.bat` again to rebuild them.
