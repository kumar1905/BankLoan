# Loan Processing — Architecture & Request Flow

This document explains how the application runs end-to-end, where requests come from, and the purpose of the main files.

---

**Quick run commands**

- Start backend:

```bash
mvn -f backend spring-boot:run
```

- Start frontend:

```bash
cd frontend
npm install
npm run dev
```

---

**High-level tech stack**

- Backend: Java 21, Spring Boot (Spring Web, Spring Data JPA, Spring Security), MySQL, JWT
- Frontend: React (Vite), React Router, Tailwind CSS, Axios

---

**Overall request flow (example: Register)**

1. User fills the registration form in the UI and submits it.
   - Frontend file: [frontend/src/pages/auth/Register.jsx](frontend/src/pages/auth/Register.jsx)
2. The form handler calls the central API client:
   - [frontend/src/services/api.js](frontend/src/services/api.js) (Axios instance)
   - `POST http://localhost:8081/api/auth/register` with JSON payload `{name,email,password,role}`
3. Backend receives request on Spring's embedded Tomcat (port configured in `application.properties`).
   - Backend entry: [backend/src/main/java/com/bank/loan/LoanProcessingApplication.java](backend/src/main/java/com/bank/loan/LoanProcessingApplication.java)
   - Properties: [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties)
4. Spring routes the request to the `AuthController`:
   - [backend/src/main/java/com/bank/loan/controller/AuthController.java](backend/src/main/java/com/bank/loan/controller/AuthController.java)
   - `@PostMapping("/register")` delegates to `AuthService.register(...)`.
5. `AuthService.register(...)` performs business logic:
   - Checks duplicate email using `UserRepository.existsByEmail(...)`.
   - Encodes the password with `PasswordEncoder` and saves a `User` entity via `UserRepository.save(...)`.
   - Loads `UserDetails` via `UserDetailsService` and generates a JWT with `JwtUtil.generateToken(...)`.
   - Returns an `AuthResponse` DTO that contains the JWT and `UserDto` (id, name, email, role).
   - Key files: [backend/src/main/java/com/bank/loan/service/AuthService.java](backend/src/main/java/com/bank/loan/service/AuthService.java),
     [backend/src/main/java/com/bank/loan/security/JwtUtil.java](backend/src/main/java/com/bank/loan/security/JwtUtil.java)
6. The frontend receives the response; typical behavior is to navigate to login or store token in `localStorage`.
   - Axios interceptor in `api.js` automatically adds `Authorization: Bearer <token>` on subsequent requests if `localStorage.token` is set.

---

**Important backend files and their roles**

- `LoanProcessingApplication.java` — Spring Boot app entry point (starts the embedded Tomcat and application context).
  - [backend/src/main/java/com/bank/loan/LoanProcessingApplication.java](backend/src/main/java/com/bank/loan/LoanProcessingApplication.java)

- Controllers (`controller/`) — HTTP endpoints (map REST paths to services)
  - `AuthController.java` handles `/api/auth/*` endpoints (register/login).
    - [backend/src/main/java/com/bank/loan/controller/AuthController.java](backend/src/main/java/com/bank/loan/controller/AuthController.java)
  - `CustomerController.java`, `ManagerController.java` handle other domain endpoints (loan applications, eligibility, etc.).

- DTOs (`dto/`) — Request/response transfer objects and validation
  - `RegisterRequest`, `AuthRequest`, `AuthResponse`, `UserDto`, `LoanApplicationRequest/Response`, etc.
  - Example: [backend/src/main/java/com/bank/loan/dto/AuthResponse.java](backend/src/main/java/com/bank/loan/dto/AuthResponse.java)

- Models (`model/`) — JPA entities mapping to database tables
  - `User.java` maps `users` table. Fields: `id`, `name`, `email`, `password`, `role`, `loanApplications`.
    - [backend/src/main/java/com/bank/loan/model/User.java](backend/src/main/java/com/bank/loan/model/User.java)
  - `LoanApplication`, `Document`, `LoanType`, `Role`, `Status` live here.

- Repositories (`repository/`) — Spring Data JPA interfaces for DB access
  - `UserRepository` provides `findByEmail(...)`, `existsByEmail(...)`, basic CRUD.
    - [backend/src/main/java/com/bank/loan/repository/UserRepository.java](backend/src/main/java/com/bank/loan/repository/UserRepository.java)

- Services (`service/`) — Business logic, transactional operations
  - `AuthService` (register/login/token gen), `LoanService`, etc.
    - [backend/src/main/java/com/bank/loan/service/AuthService.java](backend/src/main/java/com/bank/loan/service/AuthService.java)

- Security (`security/`) — JWT utils, filters, Spring Security config
  - `JwtUtil.java` — creates and validates JWTs using `jwt.secret` and `jwt.expiration` from `application.properties`.
    - [backend/src/main/java/com/bank/loan/security/JwtUtil.java](backend/src/main/java/com/bank/loan/security/JwtUtil.java)
  - `JwtAuthFilter`, `CustomUserDetailsService`, and `SecurityConfig` wire authentication/authorization and add the JWT filter into the chain.

- `application.properties` — DB connection, JWT config, file upload settings, server port
  - [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties)

- Exceptions (`exception/`) — Custom exceptions and global exception handler
  - `BadRequestException`, `ResourceNotFoundException`, `GlobalExceptionHandler` map exceptions to HTTP error responses.

---

**Important frontend files and their roles**

- `frontend/src/main.jsx` — React entry point that renders `<App />`.
  - [frontend/src/main.jsx](frontend/src/main.jsx)

- `frontend/src/App.jsx` — Routing and protected routes. Provides `AuthProvider` context.
  - [frontend/src/App.jsx](frontend/src/App.jsx)

- `frontend/src/context/AuthContext.jsx` — (used to store auth state, login/logout helpers) — the UI reads/writes auth state here.

- `frontend/src/services/api.js` — Axios client with `baseURL` and a request interceptor to add `Authorization` header when token present.
  - [frontend/src/services/api.js](frontend/src/services/api.js)

- `frontend/src/pages/auth/Register.jsx` — Register page UI and submit handler.
  - [frontend/src/pages/auth/Register.jsx](frontend/src/pages/auth/Register.jsx)

- `frontend/src/components/ProtectedRoute.jsx` — Wraps routes and blocks access based on role or auth state.

---

**Sequence of a secured API call (example: manager-only endpoint)**

1. App drives navigation; user lands on a protected route guarded by `ProtectedRoute`.
2. `ProtectedRoute` checks `AuthContext` (which may read `localStorage.token`) to verify user role.
3. Frontend calls `api.get('/api/manager/some-endpoint')`.
4. Axios adds `Authorization: Bearer <token>` header.
5. Backend `JwtAuthFilter` (in security chain) extracts token, validates with `JwtUtil`, and sets `Authentication` in security context.
6. Controller receives request and Spring Security enforces role-based access (e.g., `hasRole('MANAGER')`).

---

**Why you might see "Failed to register" in the UI**

- Port mismatch: frontend must post to the actual backend `server.port` (we set `8081`). See `frontend/src/services/api.js`.
- CORS blocked (if frontend served on different host) — confirm backend allows CORS for the origin.
- Validation errors: backend uses `@Valid` and will return a 400 JSON body when required fields are missing or email invalid.
- Duplicate email: `AuthService.register` throws `BadRequestException` if `existsByEmail(...)`.
- DB connectivity: Hikari pool errors or SQL connection issues will produce server-side 5xx responses.

If the UI shows a vague message, open browser DevTools → Network tab and inspect the `POST /api/auth/register` response body and status code.

Update: The backend now returns structured error JSON (timestamp, status, message, path, and `errors` for validation). The frontend register form was updated to parse and display the `message` or validation `errors` returned by the backend for clearer feedback.

---

**Where to change common behavior**

- Backend port: change `server.port` in `backend/src/main/resources/application.properties`.
- Frontend API target: change `baseURL` in `frontend/src/services/api.js`.
- Token expiry/secret: modify `jwt.secret` and `jwt.expiration` in `application.properties`.

---

**Next steps / useful commands**

- Tail backend logs while reproducing the issue:

```powershell
mvn -f backend spring-boot:run
# or view target logs if running as a background process
```

- Reproduce register and inspect network + server logs.

---

If you want, I can:

- Add sequence diagrams or a Mermaid flow to this file.
- Expand per-file descriptions further (show important methods and line references).
- Run an automated end-to-end test that submits the same payload the UI sends and reports the exact response body and status.


