# Spring Boot + React Login App

A full-stack **registration, login and logout** application built as a learning project. It shows how authentication works from the browser to the database, using JWT (JSON Web Tokens).

- **Frontend:** React + Vite
- **Backend:** Java 17 + Spring Boot 4 (Spring Security, Spring Data JPA)
- **Database:** MySQL 8
- **Auth:** stateless JWT access tokens, passwords hashed with BCrypt
- **Build tools:** Maven (backend), npm (frontend)

## Features

- User registration with server-side validation and BCrypt password hashing
- Login that returns a signed JWT
- Protected API (`GET /api/user/profile`) that requires a valid token
- Logout, with automatic sign-out when the token is expired or invalid
- Protected routes in React, and `/login` and `/register` hidden from signed-in users
- Consistent JSON error responses (400, 401, 403, 404, 405, 409, 415, 500)
- CORS configured for the React dev server
- Light and dark theme with a toggle (remembers your choice)
- Form validation, password strength meter, loading states and clear error messages

## How it works

```text
Register  React form -> POST /api/auth/register -> Controller -> Service (BCrypt) -> Repository -> MySQL
Login     React form -> POST /api/auth/login    -> verify password -> signed JWT returned
Profile   React -> GET /api/user/profile + "Authorization: Bearer <JWT>"
              -> CORS -> JWT filter (verify signature and expiry) -> Controller -> Service -> MySQL
Logout    React deletes the token and redirects to /login
```

The server stores no session. Every request proves who it is with its token, which is what "stateless" means.

## Project structure

```text
springboot-loginpage/
├── backend/                         Spring Boot application
│   ├── pom.xml
│   ├── .env.example                 copy to .env (not committed)
│   └── src/main/
│       ├── java/com/loginapp/backend/
│       │   ├── controller/          HTTP endpoints
│       │   ├── service/             business rules
│       │   ├── repository/          database access (Spring Data JPA)
│       │   ├── entity/              JPA entities (User)
│       │   ├── dto/                 request/response shapes + validation
│       │   ├── security/            JWT service and filter, UserDetailsService, 401/403 handlers
│       │   ├── exception/           custom exceptions + global error handler
│       │   └── config/              security, CORS and password encoder setup
│       └── resources/application.properties
└── frontend/                        React + Vite application
    ├── .env.example                 copy to .env
    └── src/
        ├── pages/                   LoginPage, RegisterPage, ProfilePage
        ├── components/              Navbar, FormField, Alert, ThemeToggle
        ├── services/                api.js (all backend calls and error handling)
        ├── context/                 authentication state (AuthProvider)
        ├── hooks/                   useAuth, useTheme
        ├── routes/                  ProtectedRoute, PublicOnlyRoute
        └── App.jsx
```

## Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 17 or newer |
| Node.js | 22.22 or newer |
| MySQL | 8.x |

Maven does not need to be installed. The project includes the Maven Wrapper (`mvnw`).

## Setup

### 1. Create the database and a user

Run this in MySQL (Workbench or the `mysql` client) as an administrator, choosing your own password:

```sql
CREATE DATABASE login_app;
CREATE USER 'login_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON login_app.* TO 'login_user'@'localhost';
FLUSH PRIVILEGES;
```

The app creates the `users` table by itself on first start.

### 2. Configure the backend

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` and set:

| Variable | Meaning |
|---|---|
| `DB_USERNAME` | the MySQL user (`login_user`) |
| `DB_PASSWORD` | the password you chose above |
| `JWT_SECRET` | a random Base64 key of at least 256 bits |

Generate a JWT secret in PowerShell:

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

`.env` is ignored by Git. Never commit real secrets.

### 3. Run the backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

It starts on **http://localhost:8080**. Spring Boot DevTools is included, so the app restarts automatically when compiled classes change. Changes to `.env` need a manual restart.

### 4. Run the frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.

## API

All error responses share one shape:

```json
{ "status": 409, "message": "This email is already registered", "fieldErrors": { "email": "Email is already registered" } }
```

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/hello` | public | health check |
| POST | `/api/auth/register` | public | create an account, returns `201` and the user (never the password) |
| POST | `/api/auth/login` | public | returns `{ accessToken, tokenType, user }` |
| GET | `/api/user/profile` | Bearer token | the current user's profile |

Example:

```http
POST /api/auth/register
Content-Type: application/json

{ "name": "Pruthvi", "email": "pruthvi@example.com", "password": "Password123" }
```

```http
GET /api/user/profile
Authorization: Bearer <accessToken>
```

| Status | When |
|---|---|
| 400 | invalid input (details in `fieldErrors`) or malformed JSON |
| 401 | missing, invalid or expired token; wrong email or password |
| 403 | signed in but not allowed (for example `/api/admin/**`, which needs the `ADMIN` role) |
| 404 | unknown URL |
| 409 | email already registered |
| 500 | unexpected server error (details are logged, never sent to the client) |

## Configuration

Set in `backend/src/main/resources/application.properties`:

| Property | Default | Meaning |
|---|---|---|
| `app.jwt.expiration-ms` | `3600000` | token lifetime (1 hour) |
| `app.cors.allowed-origins` | `http://localhost:5173` | browser origins allowed to call the API |

Frontend: `VITE_API_URL` in `frontend/.env` (default `http://localhost:8080`). Values starting with `VITE_` are visible in the browser, so never put secrets there.

## Security notes

- Passwords are hashed with BCrypt and never stored or returned in plain text.
- Login returns the same error for an unknown email and a wrong password, so accounts cannot be discovered.
- BCrypt only accepts passwords up to 72 bytes; longer ones are rejected with a clear message.
- The JWT is kept in `localStorage` for simplicity. That is readable by JavaScript, so a cross-site-scripting bug would expose it.
- Logout removes the token from the browser, but a JWT cannot be revoked by the server. A copied token stays valid until it expires, which is why the lifetime is kept short.

For real production use, consider an HttpOnly cookie with refresh tokens, HTTPS, login rate limiting, and database migrations (for example Flyway) instead of `ddl-auto=update`.

## Learning notes

This project was built step by step, in this order: Java and HTTP basics, Spring Boot setup, MySQL with JPA, registration, login with JWT, Spring Security, a protected API, React with routing, connecting the frontend, logout, protected routes, error handling and CORS. It has no automated tests yet.
