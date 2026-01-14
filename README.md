# MediTutor - Platformă Self-Hosted pentru Management Meditații

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

MediTutor este o platformă completă self-hosted pentru management tutori/profesori privați. Migrat de la Lovable Cloud (Supabase) la o soluție self-hosted bazată pe Node.js, Express, PostgreSQL și React.

## 🚀 Caracteristici

### Backend
- **Node.js + Express** - API RESTful robust
- **PostgreSQL** - Bază de date relațională
- **JWT Authentication** - Autentificare securizată
- **Upload fișiere** - Storage local pentru materiale
- **Row Level Security** - Izolarea datelor per utilizator

### Frontend
- **React 18 + TypeScript** - UI modern și type-safe
- **Tailwind CSS** - Styling responsive
- **shadcn/ui** - Componente UI elegante
- **React Query** - State management și caching
- **Recharts** - Grafice interactive

### Funcționalități
✅ **Management Clienți** - CRUD complet pentru elevi  
✅ **Management Ședințe** - Programare și tracking ședințe  
✅ **CRM** - Note, obiective, progres academic  
✅ **Financiar** - Rapoarte, statistici, export PDF/TXT  
✅ **Materiale Didactice** - Upload și management documente  
✅ **Dashboard** - Statistici și overview complet  

## 📋 Cerințe de Sistem

- **Node.js** 20+ (recomandat)
- **PostgreSQL** 14+
- **Docker & Docker Compose** (opțional, pentru deployment rapid)
- **npm** sau **yarn**

## 🛠️ Instalare și Setup

### Opțiunea 1: Docker (Recomandat)

Cea mai simplă metodă pentru deployment:

```bash
# 1. Clonează/descarcă proiectul
cd MediTutor

# 2. Creează fișierul .env
cp .env.docker.example .env

# 3. Editează .env și schimbă parolele
# IMPORTANT: Schimbă DB_PASSWORD și JWT_SECRET!

# 4. Pornește toate serviciile
docker-compose up -d

# 5. Verifică statusul
docker-compose ps

# Aplicația va fi disponibilă la:
# Frontend: http://localhost
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
```

Pentru a opri serviciile:
```bash
docker-compose down
```

Pentru a vedea logs:
```bash
docker-compose logs -f
```

### Opțiunea 2: Instalare Manuală

#### Backend Setup

```bash
# 1. Instalează dependințele backend
cd backend
npm install

# 2. Creează fișierul .env
cp .env.example .env

# 3. Configurează .env cu datele tale:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - JWT_SECRET (minim 32 caractere)

# 4. Asigură-te că PostgreSQL rulează și creează baza de date
# psql -U postgres
# CREATE DATABASE meditutor;

# 5. Rulează migrațiile
npm run migrate

# 6. Pornește serverul (development)
npm run dev

# SAU pentru producție:
npm run build
npm start
```

Backend va rula pe `http://localhost:5000`

#### Frontend Setup

```bash
# 1. Instalează dependințele frontend
cd frontend
npm install

# 2. Creează fișierul .env
cp .env.example .env

# 3. Configurează VITE_API_URL (default: http://localhost:5000/api)

# 4. Pornește dev server
npm run dev

# SAU build pentru producție:
npm run build
npm run preview
```

Frontend va rula pe `http://localhost:5173`

## 📁 Structura Proiectului

```
MediTutor/
├── backend/                    # Backend Node.js/Express
│   ├── src/
│   │   ├── db/                 # Database config și migrații
│   │   │   ├── pool.ts         # PostgreSQL connection pool
│   │   │   ├── schema.sql      # Schema bazei de date
│   │   │   └── migrate.ts      # Script migrare
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   └── upload.ts       # File upload (multer)
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts         # Login/Register
│   │   │   ├── clients.ts      # CRUD clienți
│   │   │   ├── sessions.ts     # CRUD ședințe
│   │   │   ├── notes.ts        # CRM notes
│   │   │   ├── grades.ts       # Note academice
│   │   │   ├── objectives.ts   # Obiective învățare
│   │   │   ├── journals.ts     # Jurnal ședințe
│   │   │   ├── materials.ts    # Materiale didactice
│   │   │   └── stats.ts        # Statistici
│   │   ├── utils/              # Utilități
│   │   └── server.ts           # Express server
│   ├── uploads/                # Fișiere încărcate
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/         # Componente React
│   │   │   ├── ui/             # UI components (shadcn)
│   │   │   └── Sidebar.tsx     # Navigare principală
│   │   ├── contexts/           # React contexts
│   │   │   └── AuthContext.tsx # Auth state management
│   │   ├── lib/                # Utilități
│   │   │   ├── api.ts          # API client (axios)
│   │   │   └── utils.ts        # Helper functions
│   │   ├── pages/              # Pagini aplicație
│   │   │   ├── Auth.tsx        # Login/Register
│   │   │   └── Dashboard.tsx   # Dashboard principal
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf              # Nginx config pentru Docker
│   └── Dockerfile
│
├── docker-compose.yml          # Docker orchestration
├── .gitignore
└── README.md
```

## 🔐 Securitate

### Implementate:
- ✅ **JWT Authentication** - Token-based auth cu expirare
- ✅ **Password Hashing** - bcryptjs (10 rounds)
- ✅ **Row Level Security** - Fiecare user vede doar datele sale
- ✅ **CORS** - Configurabil per environment
- ✅ **Helmet** - Security headers
- ✅ **Input Validation** - express-validator
- ✅ **SQL Injection Protection** - Parameterized queries

### Recomandări Producție:
- 🔒 Schimbă `JWT_SECRET` cu un string de minim 32 caractere
- 🔒 Folosește HTTPS (nginx + Let's Encrypt)
- 🔒 Setează parole strong pentru PostgreSQL
- 🔒 Activează rate limiting (implementare viitoare)
- 🔒 Backup regulat baza de date

## 📊 Schema Bazei de Date

Baza de date conține următoarele tabele:

- **users** - Utilizatori (tutori/profesori)
- **clients** - Elevi/clienți
- **sessions** - Ședințe de meditații
- **client_notes** - Note CRM
- **client_grades** - Note academice
- **client_objectives** - Obiective învățare
- **session_journals** - Jurnal detaliat ședințe
- **client_advance_payments** - Plăți în avans
- **client_rate_history** - Istoric tarife
- **materials** - Materiale didactice

Toate tabelele au **Row Level Security** - fiecare utilizator poate accesa DOAR datele proprii.

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register - Înregistrare user nou
POST /api/auth/login    - Autentificare
```

### Clients
```
GET    /api/clients           - Lista clienți
GET    /api/clients/:id       - Detalii client
POST   /api/clients           - Creează client
PUT    /api/clients/:id       - Actualizează client
DELETE /api/clients/:id       - Șterge client
GET    /api/clients/:id/stats - Statistici client
```

### Sessions
```
GET    /api/sessions              - Lista ședințe (cu filtre)
GET    /api/sessions/:id          - Detalii ședință
POST   /api/sessions              - Creează ședință
PUT    /api/sessions/:id          - Actualizează ședință
DELETE /api/sessions/:id          - Șterge ședință
PATCH  /api/sessions/:id/mark-paid - Marchează plătit
```

### Stats
```
GET /api/stats/dashboard       - Statistici dashboard
GET /api/stats/financial       - Statistici financiare
GET /api/stats/clients-activity - Activitate clienți
GET /api/stats/monthly-summary  - Sumar lunar
```

*Toate endpoint-urile necesită header: `Authorization: Bearer <token>`*

## 🚢 Deployment Producție

### Cu Docker

```bash
# 1. Asigură-te că ai setat .env corect
# 2. Build și pornește serviciile
docker-compose up -d --build

# 3. Verifică logs
docker-compose logs -f

# 4. Backup baza de date
docker exec meditutor-db pg_dump -U postgres meditutor > backup.sql
```

### Fără Docker (VPS/Server)

1. **Setup PostgreSQL**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb meditutor
```

2. **Setup Backend**
```bash
cd backend
npm install
npm run build
# Folosește PM2 sau systemd pentru process management
pm2 start dist/server.js --name meditutor-api
```

3. **Setup Frontend (Nginx)**
```bash
cd frontend
npm install
npm run build
# Copiază dist/ în /var/www/meditutor
sudo cp -r dist/* /var/www/meditutor/
# Configurează nginx să servească static files
```

## 🔧 Troubleshooting

### Backend nu pornește
```bash
# Verifică că PostgreSQL rulează
sudo systemctl status postgresql

# Verifică logs
docker-compose logs backend

# Verifică conexiunea la DB
psql -h localhost -U postgres -d meditutor
```

### Frontend nu se conectează la backend
```bash
# Verifică VITE_API_URL în .env
# Asigură-te că backend rulează pe portul corect
curl http://localhost:5000/health
```

### Erori de migrare
```bash
# Resetează baza de date (ATENȚIE: șterge toate datele!)
docker-compose down -v
docker-compose up -d
```

## 📝 Dezvoltare Viitoare

Funcționalități planificate:
- [ ] Rate limiting pentru API
- [ ] Email notifications
- [ ] Export Excel rapoarte
- [ ] Calendar sincronizare (Google Calendar)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Tema dark mode
- [ ] Backup automat
- [ ] Two-factor authentication

## 🤝 Contribuții

Pentru bug reports sau feature requests, deschide un issue.

## 📄 Licență

MIT License - Vezi LICENSE file pentru detalii.

## 👨‍💻 Autor

Migrat de la Lovable Cloud la self-hosted de GitHub Copilot

---

**Succes cu platforma ta MediTutor! 🎓📚**

Pentru suport sau întrebări, consultă documentația sau deschide un issue.
