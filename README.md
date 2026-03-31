# Expense Tracker

A single-page dynamic website for recording, managing, filtering, and analysing personal expenses.  
This project was built for the Internet Programming assignment and demonstrates the use of **HTML, CSS, JavaScript, React, FastAPI, and MySQL** to implement a realistic full-stack CRUD application.

---

## 1. Project Title

**Expense Tracker – Single-Page Dynamic Website**

---

## 2. Problem This Website Solves

Many people record spending in scattered notes or simple calculator apps, which makes it difficult to:
- organise expenses by category,
- update or remove incorrect records,
- see monthly spending trends,
- analyse where money is being spent.

This project solves that problem by providing a single-page interface where users can create, read, update, and delete expense records stored in a database. It also supports filtering and data visualisation so users can quickly understand their spending behaviour.

---

## 3. Main Features

- Single-page application behaviour using React
- Add a new expense with:
  - title
  - category
  - amount
  - date
  - description
- View all stored expenses from the database
- Edit an existing expense
- Delete an expense
- Filter by category
- Filter by date range
- Search by title or description
- Category summary panel
- Monthly bar chart
- Click a month to inspect daily spending
- Click a day to inspect detailed expense records
- Responsive card-based layout
- MySQL database persistence

---

## 4. Technical Stack

### Frontend
- **React**
- **JavaScript**
- **CSS**
- **Chart.js / react-chartjs-2**

### Backend
- **FastAPI**
- **Python**
- **SQLModel**
- **PyMySQL**

### Database
- **MySQL**

### Development Tools
- **Vite**
- **VS Code**
- **MySQL Workbench**

---

## 5. Why This Project Qualifies as an SPA

This app behaves as a **Single-Page Application (SPA)** because:
- the user mainly interacts within one page,
- data updates dynamically without loading a different HTML page,
- adding, editing, deleting, filtering, and chart interaction all happen in the same interface.

Although the project uses a backend API and database, the frontend remains a dynamic single-page experience.

---

## 6. CRUD Mapping

| Operation | Implementation in this Project |
|---|---|
| Create | Add a new expense record |
| Read | Load and display all expense records from MySQL |
| Update | Edit an existing expense and save changes |
| Delete | Remove an expense from the database |

This means the business logic fully covers the assignment requirement for **all CRUD operations on a database**.

---

## 7. Project Screenshots and Explanations

### Figure 1. React project setup with Vite
This screenshot shows the initial setup stage where the project structure was moved from a basic frontend prototype to a React-based architecture using Vite.

![React + Vite setup](docs/images/setup_vite_react.png)

### Figure 2. React component structure
The frontend was organised into reusable components such as `ExpenseForm`, `ExpenseList`, `ExpenseItem`, `Summary`, and `Trend`.  
This structure improves readability, maintainability, and code reuse.

![React component structure](docs/images/react_component_structure.png)

### Figure 3. State management logic in App.jsx
This screenshot shows part of the state logic used to manage expenses in the frontend.  
During development, the app evolved from local state and localStorage to a full frontend–backend–database workflow.

![App state logic](docs/images/app_state_logic.png)

### Figure 4. FastAPI CRUD endpoints
This screenshot shows the FastAPI documentation page generated automatically by `/docs`.  
It clearly demonstrates the backend API structure with:
- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/{expense_id}`
- `DELETE /expenses/{expense_id}`

![FastAPI CRUD endpoints](docs/images/fastapi_crud_docs.png)

> Tip: For final submission, you can additionally replace or extend these figures with direct screenshots of the finished website UI, charts, filters, and MySQL table records.

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

### Database
```text
expense_tracker.sql
```

---

## 9. How the System Works

### Frontend flow
1. The user fills in the expense form.
2. React validates the required fields.
3. The frontend sends a request to the FastAPI backend.
4. The backend performs CRUD operations on MySQL.
5. Updated data is fetched back and rendered on the same page.

### Backend flow
- FastAPI defines API routes for expense operations.
- SQLModel maps Python models to the MySQL table.
- MySQL stores records persistently.

### Data visualisation flow
- Expense data is grouped by month and day.
- Chart.js renders monthly and daily trends.
- Users can drill down from monthly chart to daily chart and then to detailed expense entries.

---

## 10. Setup Instructions

### A. Clone or download the project
Make sure you have both folders:
- `expense-tracker-react`
- `expense-tracker-backend`

---

### B. Install software
You need:
- Node.js
- Python
- MySQL Server
- MySQL Workbench

---

### C. Set up the database
Open MySQL Workbench and run:

```sql
CREATE DATABASE expense_tracker;
```

If you already have an SQL export file, import it into the `expense_tracker` database.

---

### D. Backend setup

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

---

### E. Frontend setup

Open another terminal and go to the frontend folder:

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

The app usually opens at:

```text
http://localhost:5173
```

If Vite uses another port such as `5174`, the backend CORS settings must allow that local origin.

---

## 11. Database Configuration

The backend database connection is configured in `db.py`, for example:

```python
DATABASE_URL = "mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/expense_tracker"
```

Before running the backend, replace `YOUR_PASSWORD` with your own MySQL root password.

---

## 12. Challenges Overcome

One challenge was gradually evolving the project from a basic HTML/CSS/JavaScript prototype into a full React-based single-page application.  
Another challenge was synchronising frontend state with backend API responses so that create, edit, and delete operations updated correctly without breaking the SPA behaviour.  
Database integration also introduced issues such as missing schemas, incorrect connection strings, and MySQL environment differences across computers.  
CORS became another major challenge when moving the project between devices, because different local development ports such as `5173` and `5174` caused blocked requests.  
Finally, the chart interaction logic required extra refinement to support month-level overview, daily drill-down, and record-level detail views while keeping the interface readable.

---

## 13. Future Improvements

- Add user accounts and login
- Add export to CSV
- Add dark mode
- Add budget warnings
- Add category pie chart
- Deploy frontend and backend online for easier demonstration

---

## 14. Assignment Requirement Checklist

- [x] Behaves like a single-page application
- [x] Includes all CRUD operations
- [x] Uses a real database
- [x] Has a streamlined business workflow
- [x] Includes frontend and backend integration
- [x] Includes filtering and visualisation
- [x] Uses a structured folder layout

---

## 15. Author

Developed as an individual assignment for Internet Programming.
