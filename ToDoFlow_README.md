# ToDoFlow

A full-stack To-Do list application with user authentication, category organization, and CRUD operations. Built with React on the frontend and Node.js/Express + Sequelize (SQLite) on the backend.

---

## 🚀 Features

- **User Authentication**  
  - Register & login with JWT  
  - Protected routes for your to-dos  
- **To-Do Management**  
  - Create, read, update, delete tasks  
  - Mark tasks as completed  
- **Categories**  
  - Assign tasks to categories  
  - “General” category created by default  
  - Filter tasks by category  
- **Real-time feedback** with toast notifications  
- **Form validation** with Formik & Yup  

---

## 🛠️ Tech Stack

| Layer        | Technologies                                                                 |
|--------------|-------------------------------------------------------------------------------|
| **Frontend** | React · React Router · Redux Toolkit · MUI · Axios · Formik · Yup · Styled-Components |
| **Backend**  | Node.js · Express · Sequelize ORM · SQLite · JWT · Express-Validator · CORS · Morgan · Rate-Limiter |
| **Dev Tools**| concurrently · nodemon · Jest · Supertest                                     |

---

## 📦 Prerequisites

- **Node.js** (v16+)  
- **npm** (v8+)

---

## ⚙️ Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/OgzhnTarhn/ToDoFlow.git
   cd ToDoFlow
   ```

2. **Install all dependencies**  
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**  
   Create a `.env` in the `backend/` folder:
   ```env
   PORT=3001
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

---

## ▶️ Running the App

```bash
npm run start
```

- **Frontend** → http://localhost:3000  
- **Backend API** → http://localhost:3001/api  

---

## 📁 Project Structure

```
ToDoFlow/
├── backend/            # Express API
│   ├── config/         # DB connection
│   ├── middleware/     # auth & error handlers
│   ├── models/         # Sequelize models
│   ├── routes/         # auth & todo endpoints
│   ├── server.js       # entry point
│   └── package.json
├── frontend/           # React client
│   ├── public/
│   ├── src/
│   │   ├── api/         # Axios instances
│   │   ├── components/  # UI components
│   │   ├── features/    # Redux slices
│   │   ├── hooks/       # custom hooks
│   │   └── App.jsx
│   └── package.json
├── .gitignore
└── package.json        # root scripts
```

---

## 📖 API Reference

### Authentication

| Method | Endpoint             | Body                       | Description                       |
|:------:|----------------------|----------------------------|-----------------------------------|
| POST   | `/api/auth/register` | `{ username, email, password }` | Create new user & return JWT      |
| POST   | `/api/auth/login`    | `{ email, password }`          | Authenticate & return JWT         |

### To-Dos (Protected)

> **All `/api/todos` routes require**:  
> `Authorization: Bearer <token>` in headers.

| Method | Endpoint              | Body                                   | Description         |
|:------:|-----------------------|----------------------------------------|---------------------|
| GET    | `/api/todos`          | _none_ (optional `?category=<id>`)     | List your to-dos    |
| POST   | `/api/todos`          | `{ title, description?, categoryId? }` | Create a new to-do  |
| PUT    | `/api/todos/:id`      | `{ title?, description?, completed? }` | Update a to-do      |
| DELETE | `/api/todos/:id`      | _none_                                 | Delete a to-do      |

---

## 🧪 Testing

### Backend

```bash
cd backend
npm run test
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/XYZ`)  
3. Commit your changes (`git commit -m 'Add XYZ'`)  
4. Push to the branch (`git push origin feature/XYZ`)  
5. Open a Pull Request  

---

## 📄 License

This project is licensed under the ISC License.
