# Made In Veedu (Organic Masalas, Health Mixes & Traditional Snacks)

Made In Veedu is a premium e-commerce platform built with an **Apple 2026 UI/UX design theme** (Glassmorphism, Generative UI, light/dark mode, and smooth animations) using a modern, scalable fullstack architecture.

---

## 🛠️ Technology Stack

- **Frontend**: ReactJS, Vite, TailwindCSS, Framer Motion, Redux Toolkit, Axios, React Router DOM, Recharts.
- **Backend**: Spring Boot 3, Spring Security, JWT Authentication, JPA Hibernate, Spring Mail.
- **AI Microservice**: Python FastAPI, Scikit-Learn (TF-IDF Content-Based Recommendations), Pandas, NumPy.
- **Database**: MySQL.
- **Orchestration**: Docker & Docker Compose.

---

## 🔒 Security Features (OWASP Top 10 Compliance)

1. **JPA Prepared Statements**: Built-in SQL Injection prevention.
2. **AES-256 Field Encryption**: Transparently encrypts sensitive user data (phone numbers, full address details, pincodes) inside the MySQL database columns.
3. **Stateless JWT Security**: Signatures validated with high-entropy keys. Access and Refresh tokens are handled independently.
4. **Security Headers**: OWASP headers injected:
   - `Content-Security-Policy` (CSP)
   - `X-Frame-Options` (Clickjacking protection)
   - `X-XSS-Protection`
   - `Strict-Transport-Security` (HSTS)
5. **BCrypt Password Hashing**: Passwords never touch the database in plain text.

---

## 📧 SMTP Email Notification Templates

Connected to Gmail SMTP. Delivers custom HTML templates for:
- **Welcome Message**: Triggered upon account registration.
- **Order Confirmation**: Recaps items bought, grand total, and shipping address.
- **Shipping Notifications**: Issued when the status changes to `Shipping` with tracking guidelines.
- **Delivery Alerts**: Triggered when status is marked `Delivered` requesting a review.
- **Password Reset OTP**: Generates a secure 6-digit OTP that expires in 5 minutes.

---

## 👥 Default Administrator Credentials

When the Spring Boot application starts, it programmatically seeds the default administrator account:
- **Email**: `desienterprises1011@gmail.com`
- **Password**: `madeinveedu2026@appv1`
- **Phone**: `9025963164`

---

## 🐳 Quick Start (Orchestrated Run via Docker Compose)

Make sure you have Docker and Docker Compose installed, then run from the root directory:

```bash
docker-compose up --build
```

### Accessing services:
- **React Frontend (UI)**: [http://localhost](http://localhost) (mapped on port 80)
- **Spring Boot (Backend REST APIs)**: [http://localhost:8080](http://localhost:8080)
- **FastAPI (AI Microservice)**: [http://localhost:8000](http://localhost:8000)
- **MySQL (Database)**: [http://localhost:3306](http://localhost:3306) (Credentials: user `root`, password `rootpassword`)

---

## 📂 Project Structure

```text
├── sql/
│   ├── schema.sql           # MySQL database tables definition
│   └── data.sql             # Seeds products catalog (masalas, snacks) & coupons
├── backend/
│   ├── src/                 # Spring Boot source code
│   ├── pom.xml              # Maven dependencies configuration
│   └── Dockerfile           # Java build instructions
├── ai-service/
│   ├── main.py              # FastAPI endpoints (recs, NLP search, chatbot)
│   ├── requirements.txt     # Python packages list
│   └── Dockerfile           # Python build instructions
├── frontend/
│   ├── src/                 # React source code (components, pages, store)
│   ├── tailwind.config.js   # Tailwind theme rules
│   ├── nginx.conf           # SPA router redirect configs
│   └── Dockerfile           # Node build & Nginx containerization
└── docker-compose.yml       # Orchestrates all service containers
```

---

## ⚙️ Manual Running of Individual Services

### 1. Database
Run a local MySQL instance on port `3306` with database `madeinveedu`. Run the scripts inside `sql/schema.sql` and `sql/data.sql`.

### 2. Backend
Set env variables (or edit `backend/src/main/resources/application.yml`):
- `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/madeinveedu`
- `SPRING_DATASOURCE_USERNAME=root`
- `SPRING_DATASOURCE_PASSWORD=rootpassword`
- `SPRING_MAIL_USERNAME=desienterprises1011@gmail.com`
- `SPRING_MAIL_PASSWORD=your_gmail_app_password`

```bash
cd backend
mvn clean spring-boot:run
```

### 3. AI Service
Create a python virtualenv, install dependencies, and launch:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to [http://localhost:5173](http://localhost:5173).
