# 🚀 Instrucțiuni de Instalare - MediTutor

## ⚠️ Erorile cu ROȘU sunt NORMALE!

Fișierele apar cu **roșu în VS Code** pentru că **lipsesc node_modules**. Acest lucru este **normal** și se va rezolva după instalarea dependințelor.

---

## 📋 Opțiuni de Instalare

### ✅ OPȚIUNEA 1: Docker (CEL MAI SIMPLU) - Recomandat

```bash
# 1. Asigură-te că ai Docker Desktop instalat
# Download de pe: https://www.docker.com/products/docker-desktop

# 2. Pornește aplicația
docker-compose up -d

# 3. Verifică că rulează
docker-compose ps

# 4. Accesează aplicația
# Frontend: http://localhost
# Backend: http://localhost:5000
```

**Cu Docker NU trebuie să instalezi Node.js sau PostgreSQL!**

---

### ✅ OPȚIUNEA 2: Instalare Manuală (Development)

Această opțiune necesită mai mult setup, dar este bună pentru development.

#### Pasul 1: Instalează Prerequisites

**Windows:**
```bash
# 1. Instalează Node.js 20+
# Download: https://nodejs.org/

# 2. Instalează PostgreSQL 14+
# Download: https://www.postgresql.org/download/windows/

# Verifică instalarea:
node --version  # Trebuie să fie 20+
npm --version
psql --version  # Trebuie să fie 14+
```

**Linux/Mac:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### Pasul 2: Setup Database

```bash
# Windows: Deschide SQL Shell (psql)
# Linux/Mac: Deschide terminal

# Conectează-te la PostgreSQL
psql -U postgres

# Creează database
CREATE DATABASE meditutor;

# Ieși
\q
```

#### Pasul 3: Instalează dependințele BACKEND

```bash
# În terminal/cmd, navighează la folder backend
cd backend

# Instalează dependințe
npm install

# Acest pas durează ~2-3 minute
# Va instala ~200+ pachete

# Verifică că s-a instalat corect
npm list express
# Trebuie să afișeze versiunea Express
```

#### Pasul 4: Rulează migrațiile DB

```bash
# Tot în folder backend
npm run migrate

# Trebuie să vezi:
# ✅ Database migrations completed successfully!
```

#### Pasul 5: Pornește Backend

```bash
# În folder backend
npm run dev

# Trebuie să vezi:
# ╔═══════════════════════════════════════╗
# ║     MediTutor Backend Server         ║
# ║     Server running on port 5000      ║
# ╚═══════════════════════════════════════╝
```

**LASĂ acest terminal DESCHIS!**

#### Pasul 6: Instalează dependințele FRONTEND (Terminal NOU)

```bash
# Deschide un TERMINAL NOU
# Navighează la folder frontend
cd frontend

# Instalează dependințe
npm install

# Durează ~1-2 minute
```

#### Pasul 7: Pornește Frontend

```bash
# Tot în folder frontend
npm run dev

# Trebuie să vezi:
# VITE ready in 500ms
# ➜  Local:   http://localhost:5173
```

#### Pasul 8: Accesează Aplicația

Deschide browser la: **http://localhost:5173**

---

## 🔧 Cum să REPARI erorile cu ROȘU în VS Code

După ce ai instalat dependințele, erorile ar trebui să dispară. Dacă nu:

### 1. Reload VS Code
```
Ctrl+Shift+P → "Developer: Reload Window"
```

### 2. Restart TypeScript Server
```
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### 3. Verifică că node_modules există

```bash
# Backend
dir backend\node_modules   # Windows
ls backend/node_modules     # Linux/Mac

# Frontend
dir frontend\node_modules   # Windows
ls frontend/node_modules    # Linux/Mac

# Dacă nu există, rulează din nou:
cd backend
npm install

cd ../frontend
npm install
```

---

## ❓ Troubleshooting Erori Comune

### Eroare: "Cannot find module 'express'"

**Cauză:** Nu s-a instalat npm dependencies

**Soluție:**
```bash
cd backend
npm install
```

### Eroare: "Cannot find type definition file for 'node'"

**Cauză:** Lipsesc @types

**Soluție:**
```bash
cd backend
npm install
# package.json are deja @types/node în devDependencies
```

### Eroare: "Port 5000 is already in use"

**Cauză:** Alt proces folosește portul 5000

**Soluție Windows:**
```bash
# Găsește procesul
netstat -ano | findstr :5000

# Omoară procesul (înlocuiește PID)
taskkill /PID <PID> /F
```

**Soluție Linux/Mac:**
```bash
# Găsește și omoară
lsof -ti:5000 | xargs kill -9
```

### Eroare: "Cannot connect to database"

**Cauză:** PostgreSQL nu rulează sau credențiale greșite

**Soluție:**
```bash
# Windows: Verifică în Services că PostgreSQL rulează
# Linux/Mac:
sudo systemctl status postgresql

# Verifică credențialele în backend/.env
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres (sau parola ta)
```

### Frontend: "Failed to fetch" sau "Network Error"

**Cauză:** Backend nu rulează

**Soluție:**
1. Verifică că backend rulează pe port 5000
2. Deschide http://localhost:5000/health în browser
3. Trebuie să vezi: `{"status":"ok","timestamp":"..."}`

---

## 📊 Verificare Instalare Corectă

După instalare, verifică:

### ✅ Backend
```bash
# Health check
curl http://localhost:5000/health

# SAU deschide în browser:
http://localhost:5000/health

# Răspuns așteptat:
{"status":"ok","timestamp":"2024-01-14T..."}
```

### ✅ Frontend
```bash
# Deschide în browser:
http://localhost:5173

# Trebuie să vezi pagina de Login/Register
```

### ✅ Database
```bash
# Conectează-te
psql -U postgres -d meditutor

# Verifică tabele
\dt

# Trebuie să vezi 10 tabele:
# users, clients, sessions, etc.
```

---

## 🎯 Rezumat Quick Start

**Docker (2 comenzi):**
```bash
docker-compose up -d
# Accesează: http://localhost
```

**Manual (6 pași):**
```bash
# 1. Setup PostgreSQL și creează DB "meditutor"
# 2. cd backend && npm install
# 3. npm run migrate
# 4. npm run dev (lasă deschis)
# 5. (Terminal nou) cd frontend && npm install
# 6. npm run dev
# Accesează: http://localhost:5173
```

---

## 📞 Ajutor Suplimentar

- Vezi [README.md](README.md) pentru documentație completă
- Vezi [QUICKSTART.md](QUICKSTART.md) pentru ghid rapid
- Probleme specifice? Caută în fișierul de erori

---

**Notă Finală:** Erorile cu ROȘU sunt NORMALE înainte de `npm install`! Nu te panica! 😊
