# MockAPI Service — Project Documentation

## Overview

A web application that lets developers mock REST APIs. A developer creates a named project, then defines mock endpoints (path + method + status + JSON response). Each endpoint is immediately available at a public URL — any HTTP client hitting that URL gets back the configured status code and JSON body.

**Public mock URL format:**
```
http://<hostname>/<project-name>/<endpoint-path>
```

Example: `POST http://localhost:8080/my-app/api/users` → returns `201` + `{"id": 1, "name": "Alice"}`

---

## Tech Stack

### Backend
- **Language:** Go 1.21+
- **HTTP:** Gin (`github.com/gin-gonic/gin`)
- **Database:** PostgreSQL (via `pgx/v5`)
- **Auth:** JWT (`github.com/golang-jwt/jwt/v5`)
- **IDs:** UUID (`github.com/google/uuid`)
- **Password hashing:** bcrypt (`golang.org/x/crypto`)
- **Architecture:** DDD (Domain-Driven Design)

### Frontend
- **Framework:** React 18 + TypeScript
- **Component format:** TSX
- **Styles:** CSS Modules
- **Bundler:** Rollup.js
- **HTTP client:** Axios
- **Routing:** React Router v6
- **Architecture:** FSD (Feature Slice Design)

### Monorepo layout
```
mock-api-service/
├── CLAUDE.md
├── backend/
└── frontend/
```

---

## Backend Architecture (DDD)

```
backend/
├── cmd/server/main.go              # entrypoint
├── internal/
│   ├── domain/                     # pure domain — no external deps
│   │   ├── user/
│   │   │   ├── entity.go           # User struct + domain methods
│   │   │   └── repository.go       # UserRepository interface
│   │   ├── project/
│   │   │   ├── entity.go
│   │   │   └── repository.go
│   │   └── mockendpoint/
│   │       ├── entity.go
│   │       └── repository.go
│   ├── application/                # use cases / services
│   │   ├── user/service.go
│   │   ├── project/service.go
│   │   └── mockendpoint/service.go
│   ├── infrastructure/             # concrete implementations
│   │   ├── postgres/
│   │   │   ├── db.go               # connection pool setup
│   │   │   ├── user_repo.go
│   │   │   ├── project_repo.go
│   │   │   └── mockendpoint_repo.go
│   │   └── config/config.go        # env-based config
│   └── interfaces/
│       └── http/
│           ├── router.go           # route registration
│           ├── handlers/
│           │   ├── auth.go
│           │   ├── project.go
│           │   ├── mockendpoint.go
│           │   └── mock_proxy.go   # serves the actual mock requests
│           └── middleware/
│               └── auth.go         # JWT middleware
└── migrations/
    ├── 001_create_users.sql
    ├── 002_create_projects.sql
    └── 003_create_mock_endpoints.sql
```

### Domain entities

**User** — `domain/user/entity.go`
- `ID uuid`, `Email string`, `PasswordHash string`, `CreatedAt time.Time`

**Project** — `domain/project/entity.go`
- `ID uuid`, `UserID uuid`, `Name string` (unique per user, used in URL), `CreatedAt time.Time`

**MockEndpoint** — `domain/mockendpoint/entity.go`
- `ID uuid`, `ProjectID uuid`, `Path string`, `Method string`, `StatusCode int`, `ResponseData json.RawMessage`, `CreatedAt time.Time`
- Unique constraint: `(project_id, path, method)`

### API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/projects` | Yes | List user's projects |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/:name` | Yes | Get project details |
| DELETE | `/api/projects/:name` | Yes | Delete project |
| GET | `/api/projects/:name/endpoints` | Yes | List endpoints |
| POST | `/api/projects/:name/endpoints` | Yes | Create endpoint |
| GET | `/api/projects/:name/endpoints/:id` | Yes | Get endpoint |
| DELETE | `/api/projects/:name/endpoints/:id` | Yes | Delete endpoint |
| ANY | `/:projectName/*path` | No | **Serve mock response** |

### Mock proxy logic
`interfaces/http/handlers/mock_proxy.go` — handles any HTTP method on `/:projectName/*path`. Looks up project by name, then finds a `MockEndpoint` matching `(path, method)`. Returns the stored `status_code` and `response_data` as JSON. Returns `404` if project or endpoint not found.

---

## Frontend Architecture (FSD)

```
frontend/src/
├── app/                            # app-level: providers, routing, global styles
│   ├── providers/RouterProvider.tsx
│   ├── App.tsx
│   └── index.tsx
├── pages/                          # route-level components
│   ├── login/ui/LoginPage.tsx
│   ├── register/ui/RegisterPage.tsx
│   ├── projects/ui/ProjectsPage.tsx
│   ├── project-detail/ui/ProjectDetailPage.tsx
│   └── api-detail/ui/ApiDetailPage.tsx
├── widgets/                        # composite blocks (header, sidebar)
│   └── header/ui/Header.tsx
├── features/                       # user interactions
│   ├── auth/
│   │   ├── login/{ui/LoginForm.tsx, model/useLogin.ts}
│   │   └── register/{ui/RegisterForm.tsx, model/useRegister.ts}
│   ├── project/
│   │   ├── create/{ui/CreateProjectModal.tsx, model/useCreateProject.ts}
│   │   └── list/ui/ProjectList.tsx
│   └── mock-api/
│       ├── create/{ui/CreateApiModal.tsx, model/useCreateApi.ts}
│       └── list/ui/ApiList.tsx
├── entities/                       # business objects + their API calls
│   ├── user/{model/types.ts, api/userApi.ts}
│   ├── project/{model/types.ts, api/projectApi.ts}
│   └── mock-api/{model/types.ts, api/mockApiApi.ts}
└── shared/                         # primitives used by any layer
    ├── api/instance.ts             # axios instance + interceptors
    ├── ui/{Button, Input, Card, Modal, Badge}
    ├── lib/auth.ts                 # token storage helpers
    └── config/index.ts             # env constants
```

### Pages

| Page | Route | Description |
|------|-------|-------------|
| LoginPage | `/login` | Email + password form |
| RegisterPage | `/register` | Email + password form |
| ProjectsPage | `/` | Grid of user projects + create button |
| ProjectDetailPage | `/projects/:name` | List of endpoints + create button |
| ApiDetailPage | `/projects/:name/endpoints/:id` | Endpoint details + full mock URL |

### Auth flow
- JWT stored in `localStorage`
- Axios interceptor attaches `Authorization: Bearer <token>` to all requests
- On 401 response — redirect to `/login`
- Protected routes wrapped in a guard component

---

## Database schema

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrations/002_create_projects.sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- migrations/003_create_mock_endpoints.sql
CREATE TABLE mock_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL DEFAULT 200,
    response_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, path, method)
);
```

---

## Environment variables (backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |
| `DATABASE_URL` | — | PostgreSQL DSN |
| `JWT_SECRET` | — | Secret for signing JWT |
| `JWT_TTL_HOURS` | `72` | Token TTL in hours |

---

## Running locally

### Backend
```bash
cd backend
export DATABASE_URL="postgres://user:pass@localhost:5432/mockapi?sslmode=disable"
export JWT_SECRET="change-me"
go run ./cmd/server
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # rollup --watch + dev server
```

### Migrations (manual)
```bash
psql $DATABASE_URL -f migrations/001_create_users.sql
psql $DATABASE_URL -f migrations/002_create_projects.sql
psql $DATABASE_URL -f migrations/003_create_mock_endpoints.sql
```
