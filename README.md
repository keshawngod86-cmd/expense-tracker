# Expense Tracker

A single-page dynamic website for recording, managing, filtering, and analysing personal expenses.  
This project was developed as an individual Internet Programming assignment and demonstrates the integration of **HTML, CSS, JavaScript, React, FastAPI, and MySQL** in a full-stack CRUD application.

---

## 1. Project Title

**Expense Tracker – Single-Page Dynamic Web Application**

---

## 2. Problem This Website Solves

Many users record daily expenses in notes apps, paper records, or simple calculator tools. These methods are often inconvenient because they do not support structured categorisation, quick editing, trend analysis, or persistent storage.

This website solves that problem by allowing users to:
- record expenses in one place,
- organise them by category,
- update or remove incorrect records,
- view summaries and trends,
- store the data in a real database.

---

## 3. Main Features

- Single-page application behaviour using React
- Add a new expense record
- View all expense records from the database
- Edit an existing expense
- Delete an expense
- Search by title or description
- Filter by category
- Filter by date range
- Category summary display
- Monthly and daily trend visualisation
- Interactive chart drill-down
- MySQL database persistence

---

## 4. Technical Stack

### Frontend
- React
- JavaScript
- CSS
- Chart.js / react-chartjs-2

### Backend
- FastAPI
- Python
- SQLModel
- PyMySQL

### Database
- MySQL

### Development Tools
- Vite
- VS Code
- MySQL Workbench

---

## 5. Why This Project Qualifies as an SPA

This website behaves like a **Single-Page Application (SPA)** because:
- the user mainly works inside one main page,
- content updates dynamically without loading a new HTML page,
- add, edit, delete, filter, and chart interactions all happen within the same interface.

This matches the assignment requirement that the app should dynamically rewrite the current page instead of constantly loading new pages from the server.

---

## 6. CRUD Mapping

| Operation | Implementation |
|---|---|
| Create | Add a new expense |
| Read | Load and display all expenses from MySQL |
| Update | Edit an existing expense and save changes |
| Delete | Remove an expense from the database |

The project therefore covers **all CRUD operations on a database**.

---

## 7. Project Screenshots and Development Evidence

### Figure 1. Final website interface overview
This screenshot shows the expense tracker interface with the main form, list view, category summary, and monthly trend area. It demonstrates the single-page structure and the core business workflow.

![Website UI overview](docs/images/website_ui_overview.png)

### Figure 2. React project setup with Vite
This screenshot shows the early setup stage of the frontend project in React. It reflects the transition from a basic prototype to a structured React application.

![Project setup with Vite](docs/images/project_setup_vite.png)

### Figure 3. React component structure
This screenshot shows the component-based structure of the frontend. The project was organised into reusable components such as `ExpenseForm`, `ExpenseList`, `ExpenseItem`, `Summary`, and `Trend`.

![React component structure](docs/images/react_component_structure.png)

### Figure 4. App state management logic
This screenshot shows part of the React logic used to manage expense state and component updates. It reflects how the interface dynamically responds to user actions without changing pages.

![App state management](docs/images/app_state_management.png)

### Figure 5. FastAPI CRUD endpoint documentation
This screenshot shows the FastAPI auto-generated documentation page. It demonstrates the backend API used to support full CRUD operations:
- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/{expense_id}`
- `DELETE /expenses/{expense_id}`

![FastAPI CRUD docs](docs/images/fastapi_crud_docs.png)

### Figure 6. Early frontend form and list version
This screenshot records an earlier implementation stage where the form and expense list were already working in one page. It shows the incremental development process of the interface.

![Early form and list version](docs/images/form_and_list_early_version.png)

### Figure 7. Delete feature and UI refinement
This screenshot shows a later stage where the delete functionality and UI button styling were refined. It is evidence of improving both business logic and interaction feedback.

![Delete feature UI](docs/images/delete_feature_ui.png)

### Figure 8. Edit logic implementation
This screenshot shows part of the edit feature logic. During development, the edit workflow required additional debugging to ensure updated records replaced the original record correctly.

![Edit logic code](docs/images/edit_logic_code.png)

---

## 8. Folder Structure

### Frontend
```text
expense-tracker-react/
├── src/
│   ├── components/
│   │   ├── ExpenseForm.jsx
│   │   ├── ExpenseItem.jsx
│   │   ├── ExpenseList.jsx
│   │   ├── Summary.jsx
│   │   └── Trend.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── package.json
└── package-lock.json
```

### Backend
```text
expense-tracker-backend/
├── main.py
├── db.py
├── models.py
├── requirements.txt
└── .venv/
```

### Supporting files
```text
README.md
docs/images/
expense_tracker.sql
```

---

## 9. How the System Works

### Frontend flow
1. The user enters expense information in the form.
2. React validates the input fields.
3. The frontend sends requests to the FastAPI backend.
4. The backend performs CRUD operations on MySQL.
5. The page updates dynamically after the latest data is returned.

### Backend flow
- FastAPI defines the API endpoints.
- SQLModel maps Python classes to the MySQL table.
- MySQL stores records persistently.

### Data visualisation flow
- Expense data is grouped by month and by day.
- Monthly charts help users identify large spending periods.
- Daily drill-down interaction helps users inspect detailed spending on selected dates.

---

## 10. Setup Instructions

### A. Required Software
Install the following first:
- Node.js
- Python
- MySQL Server
- MySQL Workbench

---

### B. Database setup
Open MySQL Workbench and create the database:

```sql
CREATE DATABASE expense_tracker;
```

Then make sure the backend uses this same database name in `db.py`.

If you have an SQL export file, import it into `expense_tracker`.

---

### C. Backend setup

Go to the backend folder:

```bash
cd expense-tracker-backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it in PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run the backend:

```bash
python -m uvicorn main:app --reload
```

The backend usually runs at:

```text
http://127.0.0.1:8000
```

---

### D. Frontend setup

Open another terminal:

```bash
cd expense-tracker-react
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

If Vite assigns another local port such as `5174`, make sure the backend CORS configuration allows it.

---

## 11. Database Connection

In `expense-tracker-backend/db.py`, the database connection is configured like this:

```python
DATABASE_URL = "mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/expense_tracker"
```

Replace `YOUR_PASSWORD` with your actual MySQL root password before starting the backend.

---

## 12. Challenges Overcome

One challenge was moving from an early frontend-only prototype to a complete full-stack architecture with React, FastAPI, and MySQL.  
Another challenge was implementing edit logic correctly so that an updated record replaced the original data instead of creating duplicated records.  
The project also involved solving delete-event issues, form handling problems, and decimal input validation.  
When moving the project between different computers, environment setup and CORS configuration became another challenge, especially because Vite sometimes used different local ports such as `5173` and `5174`.  
Finally, the chart component required several refinements to support better data presentation, drill-down interaction, and category-oriented analysis.

---

## 13. Future Improvements

- Add user accounts and login
- Add export to CSV
- Add budget limit alerts
- Add dark mode
- Add more advanced charts
- Deploy frontend and backend online for easier access

---

## 14. Assignment Requirement Checklist

- [x] Behaves like a single-page application
- [x] Includes all CRUD operations
- [x] Uses a real database
- [x] Has a practical workflow
- [x] Uses frontend and backend integration
- [x] Includes filtering and data visualisation
- [x] Has a structured folder layout

---

## 15. Author

Developed as an individual assignment for Internet Programming.
