# Arhitectura MediTutor Self-Hosted

## Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (Browser / Mobile)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   FRONTEND (Port 80/443)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + Vite                      │   │
│  │  - Tailwind CSS + shadcn/ui                        │   │
│  │  - React Router (SPA routing)                      │   │
│  │  - React Query (state management)                  │   │
│  │  - Axios (API client)                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                    │
│                    Nginx (Production)                        │
│                  Vite Dev Server (Dev)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
                         │ /api/*
┌────────────────────────▼────────────────────────────────────┐
│                  BACKEND API (Port 5000)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js 20 + Express + TypeScript                 │   │
│  │                                                     │   │
│  │  Middleware:                                       │   │
│  │  ├── JWT Authentication                            │   │
│  │  ├── CORS                                          │   │
│  │  ├── Helmet (Security Headers)                    │   │
│  │  ├── Compression                                   │   │
│  │  ├── Morgan (Logging)                             │   │
│  │  └── Multer (File Upload)                         │   │
│  │                                                     │   │
│  │  Routes:                                           │   │
│  │  ├── /auth       - Login/Register                 │   │
│  │  ├── /clients    - CRUD Clients                   │   │
│  │  ├── /sessions   - CRUD Sessions                  │   │
│  │  ├── /notes      - CRM Notes                      │   │
│  │  ├── /grades     - Academic Grades                │   │
│  │  ├── /objectives - Learning Objectives            │   │
│  │  ├── /journals   - Session Journals               │   │
│  │  ├── /materials  - Educational Materials          │   │
│  │  └── /stats      - Statistics                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                    │
│                    pg (node-postgres)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         │ (Parameterized)
┌────────────────────────▼────────────────────────────────────┐
│                 DATABASE (Port 5432)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 16                                     │   │
│  │                                                     │   │
│  │  Tables:                                           │   │
│  │  ├── users              (Authentication)           │   │
│  │  ├── clients            (Students)                 │   │
│  │  ├── sessions           (Tutoring Sessions)        │   │
│  │  ├── client_notes       (CRM Notes)                │   │
│  │  ├── client_grades      (Academic Grades)          │   │
│  │  ├── client_objectives  (Learning Goals)           │   │
│  │  ├── session_journals   (Session Details)          │   │
│  │  ├── client_advance_payments                       │   │
│  │  ├── client_rate_history                           │   │
│  │  └── materials          (Educational Resources)    │   │
│  │                                                     │   │
│  │  Features:                                         │   │
│  │  ├── Row Level Security (RLS)                     │   │
│  │  ├── Indexes for Performance                      │   │
│  │  ├── Triggers (updated_at)                        │   │
│  │  └── Foreign Key Constraints                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│              Volume: postgres_data (persistent)              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   FILE STORAGE (Local)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ./uploads/                                         │   │
│  │  ├── material-1234567890-abc.pdf                   │   │
│  │  ├── material-1234567891-def.jpg                   │   │
│  │  └── ...                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│              Volume: uploads_data (persistent)               │
└──────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │ Backend  │
└─────┬────┘                                    └────┬─────┘
      │                                              │
      │ POST /api/auth/login                        │
      │ {email, password}                           │
      ├────────────────────────────────────────────▶│
      │                                              │
      │                           [Verify Password]  │
      │                           bcrypt.compare()   │
      │                                              │
      │                           [Generate JWT]     │
      │                           jwt.sign()         │
      │                                              │
      │ {user, token}                                │
      │◀────────────────────────────────────────────┤
      │                                              │
      │ Store token in localStorage                  │
      │                                              │
      │ Subsequent requests:                         │
      │ Header: Authorization: Bearer <token>        │
      ├────────────────────────────────────────────▶│
      │                                              │
      │                           [Verify JWT]       │
      │                           jwt.verify()       │
      │                                              │
      │                           [Check user_id]    │
      │                           Extract from token │
      │                                              │
      │ Protected Resource                           │
      │◀────────────────────────────────────────────┤
      │                                              │
```

## Data Flow - Example: Create Session

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │ Backend  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │ 1. POST /api/sessions                    │
     │    + JWT token                            │
     ├───────────────────▶│                     │
     │                    │                     │
     │                    │ 2. authMiddleware   │
     │                    │    - Extract userId  │
     │                    │    - Verify JWT     │
     │                    │                     │
     │                    │ 3. Validate Input   │
     │                    │    - sessionDate    │
     │                    │    - clientId       │
     │                    │    - etc.           │
     │                    │                     │
     │                    │ 4. INSERT INTO sessions
     │                    │    (user_id, client_id, ...)
     │                    ├────────────────────▶│
     │                    │                     │
     │                    │         5. Row inserted
     │                    │         + RETURNING *
     │                    │◀────────────────────┤
     │                    │                     │
     │ 6. {session}       │                     │
     │◀───────────────────┤                     │
     │                    │                     │
```

## Row Level Security (RLS)

Toate datele sunt izolate per utilizator:

```sql
-- Example: Sessions table RLS
-- User poate vedea DOAR ședințele sale

SELECT * FROM sessions 
WHERE user_id = '123...';  -- Automat adăugat de middleware

-- Users nu pot accesa datele altor users
SELECT * FROM sessions 
WHERE user_id = '456...';  -- Returns nothing if not current user
```

## Deployment Models

### Development (Local)

```
Developer Machine
├── Backend:  npm run dev (Port 5000)
├── Frontend: npm run dev (Port 5173)
└── Database: PostgreSQL local (Port 5432)
```

### Production (Docker)

```
Server / VPS
├── Docker Compose orchestrates 3 containers:
│   ├── meditutor-db       (PostgreSQL)
│   ├── meditutor-backend  (Node.js API)
│   └── meditutor-frontend (Nginx + React build)
└── Volumes (persistent storage):
    ├── postgres_data
    └── uploads_data
```

### Production (Manual)

```
Server / VPS
├── PostgreSQL (systemd service)
├── Backend API (PM2 or systemd)
└── Frontend (Nginx serving static files)
```

## Security Layers

```
┌───────────────────────────────────────────────────────┐
│ Layer 1: Network Security                            │
│ - HTTPS/TLS                                           │
│ - Firewall rules                                      │
│ - CORS policies                                       │
└───────────────────────────────────────────────────────┘
                       │
┌───────────────────────────────────────────────────────┐
│ Layer 2: Application Security                        │
│ - Helmet (HTTP headers)                               │
│ - Input validation (express-validator)                │
│ - SQL injection protection (parameterized queries)    │
│ - File upload restrictions                            │
└───────────────────────────────────────────────────────┘
                       │
┌───────────────────────────────────────────────────────┐
│ Layer 3: Authentication & Authorization               │
│ - JWT tokens (7 days expiry)                         │
│ - Password hashing (bcryptjs, 10 rounds)             │
│ - Token verification on every request                 │
└───────────────────────────────────────────────────────┘
                       │
┌───────────────────────────────────────────────────────┐
│ Layer 4: Data Isolation                              │
│ - Row Level Security                                  │
│ - user_id checked on all queries                     │
│ - No cross-user data access                          │
└───────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Current Architecture
- Single server deployment
- All services on one machine
- Good for: 1-100 users

### Future Scaling Options

**Horizontal Scaling:**
```
         ┌──────────────┐
         │ Load Balancer│
         └──────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│Backend│  │Backend│  │Backend│
│   1   │  │   2   │  │   3   │
└───┬───┘  └───┬───┘  └───┬───┘
    └───────────┼───────────┘
                │
         ┌──────▼──────┐
         │  PostgreSQL │
         │   (Master)  │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │  PostgreSQL │
         │  (Replicas) │
         └─────────────┘
```

**Vertical Scaling:**
- Increase server resources
- Optimize database queries
- Add caching layer (Redis)

## Monitoring & Observability

### Logs
```
Backend:  docker-compose logs -f backend
Frontend: docker-compose logs -f frontend
Database: docker-compose logs -f db
```

### Health Checks
```
GET /health
Response: {"status":"ok","timestamp":"..."}
```

### Metrics to Monitor
- API response times
- Database query performance
- Error rates
- User sessions
- Storage usage

---

Pentru mai multe detalii, vezi:
- [README.md](README.md) - Documentație completă
- [API.md](API.md) - API endpoints
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
