# LAUGHS WITH RAMESH CONNECTING — Setup & Local Execution Guide

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.x or v20.x+
- **npm**: v9.x or v10.x+
- **Java JDK**: OpenJDK 17 or 21 (for Spring Boot backend)
- **Maven**: 3.8+
- **PostgreSQL**: 14+ (or SQLite/H2 for local instant dev mode)

---

## 2. Directory Structure

```
Laughs with ramesh connecting/
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── setup.md
├── frontend/             # React + Vite Client Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── data/
│   ├── index.html
│   └── package.json
└── backend/              # Spring Boot / Node REST API Application
    ├── src/
    └── pom.xml / package.json
```

---

## 3. Running Frontend Locally

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the web client in browser at:
   `http://localhost:5173`

---

## 4. Running Backend Locally

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Configure environment variables or `application.properties`:
   - Database URL: `jdbc:postgresql://localhost:5432/lwr_connecting`
   - Database User/Password: `postgres` / `postgres`
   - JWT Secret: `lwr_connecting_super_secret_jwt_key_2026_production_grade`
   - AI API Key (Optional): `OPENAI_API_KEY` or `GEMINI_API_KEY`
3. Run using Maven / Node runner:
   ```bash
   mvn spring-boot:run
   # OR
   npm start
   ```
4. API backend will be live at `http://localhost:8080/api`

---

## 5. Verification & Testing

- Access `http://localhost:5173` to test landing page, registration, login, mock tests, rank predictor, college comparison, and AI assistant.
- Use default admin credentials (`admin@lwr.com` / `Admin@123`) to access the Admin Portal.
