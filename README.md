# Bubble Bill Expense Tracker

A full-stack expense tracking app built with React, FastAPI, SQLModel, and MySQL.

The project supports normal users, admin management, expense CRUD, mobile-friendly views, spending share charts, and spending statistics. It is intentionally started with cross-platform commands instead of Windows-only one-click `.bat` scripts, so the same project can be used on macOS and Windows.

## Features

- Register and log in with user roles
- First registered account becomes admin
- Add, edit, delete, search, and filter expenses
- Mobile dashboard split into Add, Records, and Insights views
- Spending share with total spending
- Daily, monthly, and annual spending statistics
- Admin user list with search
- Admin activity log for login, register, logout, create, update, delete, and admin actions
- MySQL persistence for users, expenses, and activity history

## Project Structure

```text
expense-tracker/
|-- expense-tracker-backend/
|   |-- auth.py
|   |-- db.py
|   |-- main.py
|   |-- models.py
|   |-- requirements.txt
|   `-- setup_database.sql
|-- expense-tracker-react/
|   |-- public/
|   |-- src/
|   |-- package.json
|   `-- package-lock.json
`-- README.md
```

## Required Software

- Python 3.10 or newer
- Node.js 18 or newer
- MySQL Server
- MySQL Workbench, or another MySQL client

## Database Setup

Create the database and tables from MySQL Workbench or the MySQL command line:

```sql
SOURCE expense-tracker-backend/setup_database.sql;
```

If `SOURCE` is not available in your client, open `expense-tracker-backend/setup_database.sql` and run the SQL manually.

The backend also runs a small startup migration, so existing databases get the newer admin/user tracking columns automatically.

## Backend Setup

Run these commands from the project root:

```bash
cd expense-tracker-backend
python -m venv .venv
```

Activate the virtual environment on macOS or Linux:

```bash
source .venv/bin/activate
```

Activate the virtual environment on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install and start the backend:

```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs at:

```text
http://127.0.0.1:8000
```

## Frontend Setup

Open a second terminal from the project root:

```bash
cd expense-tracker-react
npm install
npm run dev -- --host 0.0.0.0
```

The frontend usually runs at:

```text
http://localhost:5173
```

If Vite chooses another port, use the URL shown in the terminal.

## MySQL Connection Settings

The backend reads MySQL settings from environment variables. If no environment variables are set, it uses the defaults in `expense-tracker-backend/db.py`.

Supported variables:

```text
DATABASE_URL
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
JWT_SECRET_KEY
```

Example macOS/Linux:

```bash
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=expense_tracker
export JWT_SECRET_KEY=replace_with_your_local_secret
```

Example Windows PowerShell:

```powershell
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_password"
$env:MYSQL_DATABASE="expense_tracker"
$env:JWT_SECRET_KEY="replace_with_your_local_secret"
```

## Admin Data in MySQL

Admin page data is stored in these MySQL tables:

```sql
SELECT id, username, email, role, created_at
FROM `user`;

SELECT id, title, category, amount, date, username, created_at, updated_at
FROM expense
ORDER BY created_at DESC;

SELECT id, user_id, username, action, detail, created_at
FROM useractivity
ORDER BY id DESC;
```

Passwords are stored only as bcrypt hashes in `password_hash` using `passlib`. Login uses `PyJWT` tokens with an expiry time. The admin API and admin UI do not return raw passwords.

## Reset and Seed User Expenses

After activating the backend virtual environment, you can regenerate personal test data:

```bash
python seed_user_expenses.py
```

This deletes all rows in `expense`, removes old expense activity logs, and inserts 100 random expenses for every user in the `user` table.

## Notes for Group Members

- There are no Windows-only one-click startup scripts in this version.
- Start the backend and frontend in two terminals.
- Keep `node_modules/` and `.venv/` local; rebuild them with the commands above.
- If testing from a phone, both the phone and computer must be on the same network. Use the computer LAN IP instead of `localhost`.

## API Docs

After the backend starts, FastAPI docs are available at:

```text
http://127.0.0.1:8000/docs
```

