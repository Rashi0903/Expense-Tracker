# 💰 Expense Tracker Web Application

A full-stack **Expense Tracker Web Application** developed using **Spring Boot (Backend)** and **HTML, CSS, JavaScript (Frontend)**.
The application helps users manage their daily expenses by allowing them to **add, view, and delete expense records** through a clean and simple dashboard interface.

---

## 🚀 Features

* Add new expenses with title, amount, category, date, and description
* View all expenses in a structured dashboard
* Delete existing expenses
* RESTful API based backend architecture
* Responsive and user-friendly frontend design
* Real-time data interaction using Fetch API
* Proper layered architecture implementation

  * Controller Layer
  * Service Layer
  * Repository Layer
  * Database Layer

---

## 🛠️ Tech Stack

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* Maven
* H2 / MySQL Database

### Frontend

* HTML
* CSS
* JavaScript

### Tools & Technologies

* VS Code
* IntelliJ IDEA
* Postman
* Git & GitHub

---

## 📂 Project Structure

```
expense-tracker
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── model
│   └── resources
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

---

## ⚙️ How to Run the Project

### ▶ Backend Setup

1. Open terminal inside the backend project folder
2. Run the following command

```
mvnw spring-boot:run
```

3. The backend server will start at

```
http://localhost:9090
```

---

### ▶ Frontend Setup

* Open `index.html` directly in the browser

OR

* Run using **Live Server Extension** in VS Code for better development experience

---

## 🔗 API Endpoints

| HTTP Method | Endpoint         | Description             |
| ----------- | ---------------- | ----------------------- |
| GET         | `/expenses`      | Retrieve all expenses   |
| POST        | `/expenses`      | Add a new expense       |
| DELETE      | `/expenses/{id}` | Delete an expense by ID |

---

## 🎯 Future Enhancements

* User Authentication (Login / Signup)
* Monthly Expense Analysis
* Graphical Reports & Charts
* Cloud Database Integration
* Fully Responsive Mobile UI
* Expense Category Filters

---

## 👩‍💻 Author

**Rashika Negi**
B.Tech Computer Science Engineering
Graphic Era Hill University

---

⭐ If you like this project, feel free to give it a star on GitHub!
