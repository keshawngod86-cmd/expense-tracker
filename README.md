# Bubble Bill Expense Tracker

Bubble Bill is a full-stack expense tracking web application built with React, FastAPI, SQLModel, and MySQL. The project helps users record daily spending, manage expense records, review spending categories, and inspect spending statistics through a responsive desktop and mobile interface.

The system supports normal users and admin users. Normal users can manage their own expenses, while admin users can search users, inspect user information, and review each user's added records and activity history.

## Main Features

- User registration and login
- Password hashing with `passlib` and `bcrypt`
- JWT authentication with `PyJWT`
- User role support, including normal user and admin user
- User data isolation, so each user only sees their own expense records
- Add, edit, delete, search, and filter expenses
- Expense category support, including Food, Transport, Shopping, Bills, Entertainment, and Other
- Spending Share chart with total spending
- Spending Statistics with daily, monthly, and annual views
- Desktop dashboard with Add, Records, and Insights sections
- Mobile dashboard with bottom navigation buttons
- Admin user management page with user search
- Admin user detail panel showing user profile, added expense records, and user activity history
- MySQL persistence for users, expenses, and activity logs

## Technology Stack

Frontend:

- React
- Vite
- JavaScript
- CSS
- Chart.js
- react-chartjs-2

Backend:

- FastAPI
- Python
- SQLModel
- PyMySQL
- passlib with bcrypt
- PyJWT

Database:

- MySQL

## Project Structure

```text
expense-tracker/
|-- expense-tracker-backend/
|   |-- auth.py
|   |-- db.py
|   |-- main.py
|   |-- models.py
|   |-- requirements.txt
|   |-- seed_user_expenses.py
|   `-- setup_database.sql
|-- expense-tracker-react/
|   |-- public/
|   |-- src/
|   |-- package.json
|   `-- package-lock.json
`-- README.md
```

## Required Software

Install these before running the project on a new computer:

- Python 3.10 or newer
- Node.js 18 or newer
- MySQL Server
- MySQL Workbench, or another MySQL client

## Database Setup

Open MySQL Workbench and run the SQL file below:

```text
expense-tracker-backend/setup_database.sql
```

This file creates the `expense_tracker` database and the required tables.

If you want to run it manually, open the SQL file in MySQL Workbench and click the lightning button. After running it, refresh the schema list and check that `expense_tracker` exists.

## Backend Setup on Windows

Open PowerShell in the project folder and run:

```powershell
cd expense-tracker-backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_mysql_password"
$env:MYSQL_DATABASE="expense_tracker"
$env:JWT_SECRET_KEY="bubble-bill-demo-secret"
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

If your MySQL password is already the default password in `db.py`, you can still set `MYSQL_PASSWORD` explicitly. This is safer on a new computer.

The backend runs at:

```text
http://localhost:8000
```

FastAPI documentation is available at:

```text
http://localhost:8000/docs
```

## Backend Setup on macOS

Open Terminal in the project folder and run:

```bash
cd expense-tracker-backend
python3 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
export MYSQL_USER="root"
export MYSQL_PASSWORD="your_mysql_password"
export MYSQL_DATABASE="expense_tracker"
export JWT_SECRET_KEY="bubble-bill-demo-secret"
./.venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs at:

```text
http://localhost:8000
```

## Frontend Setup

Open a second terminal from the project folder and run:

```bash
cd expense-tracker-react
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

The frontend normally runs at:

```text
http://localhost:5173
```

If Vite shows another port, use the address shown in the terminal.

## Mobile Testing

To test on a phone, make sure the computer and phone are connected to the same Wi-Fi network.

Run the frontend with:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open the Network address shown by Vite on the phone, for example:

```text
http://192.168.1.107:5173
```

If the phone can open the frontend but cannot register or log in, check that the backend is also running on port `8000` and that the computer firewall allows local network access.

## How to Use the App

1. Open the frontend page.
2. Register a new account or log in with an existing account.
3. The first registered account becomes an admin account automatically.
4. Use the Dashboard page to manage expenses.
5. In the Add section, create a new expense record.
6. In the Records section, search, filter, edit, or delete expense records.
7. In the Insights section, view spending share and spending statistics.
8. If the logged-in user is an admin, the app opens the Admin page first.
9. In the Admin page, search users and click a user card to view user information, added expenses, and activity records.

## Security Design

Password security:

- The system never stores plain text passwords.
- Passwords are hashed with `passlib` and `bcrypt` before being saved to MySQL.
- The database stores the hashed value in the `password_hash` column.

JWT authentication:

- The backend uses `PyJWT` to generate login tokens.
- A token is generated after successful login or registration.
- The token includes user information such as username, user id, role, and expiry time.
- Protected API requests use the `Authorization: Bearer <token>` header.
- Invalid or expired tokens are rejected by the backend.

Admin data protection:

- The admin API does not return raw passwords.
- The admin page only displays safe user information such as username, email, role, records, and activity history.

## Admin Data in MySQL

Useful SQL queries for checking admin data:

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

## Test Data

After the backend virtual environment is ready, you can generate sample expense data:

```bash
cd expense-tracker-backend
python seed_user_expenses.py
```

This script deletes existing expense rows, removes old expense activity logs, and inserts 100 random expense records for every user in the `user` table.

## Common Problems

If the frontend opens but register or login does not work:

- Make sure the backend is running at `http://localhost:8000`.
- Make sure MySQL is running.
- Make sure the MySQL password is correct.
- Run `python -m pip install -r requirements.txt` again inside the backend environment.

If MySQL connection fails:

- Check `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE`.
- Check that the `expense_tracker` database exists.
- Check that MySQL Server is running.

If password hashing fails:

- Make sure `bcrypt==4.0.1` is installed from `requirements.txt`.
- Run the dependency installation command again.

## Group Contributions

### Xiaotong Jiang / Keshawn

Xiaotong Jiang mainly worked on frontend optimisation, mobile interface improvement, documentation, and security fixes. He updated the responsive layout, added the logo and mobile buttons, organised the README, fixed image link issues, and handled key policy and password encryption updates.

### Yi Zhong

Yi Zhong mainly contributed to feature iteration and consumption classification. She worked on the register/login flow and helped develop the consumption classification summary to make user spending easier to understand.

### Zhe Cheng

Zhe Cheng mainly worked on backend/admin features and data visualisation. He created and improved the admin interface, implemented user data isolation and admin records, and developed the bill statistics chart with multi-time dimension switching and data loading/refresh logic during development.