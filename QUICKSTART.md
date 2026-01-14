# Quick Start Guide - MediTutor

## 🚀 Start Rapid cu Docker (5 minute)

### Pasul 1: Pregătește mediul

```bash
# Asigură-te că ai Docker instalat
docker --version
docker-compose --version
```

### Pasul 2: Configurare

```bash
# Copiază fișierul de configurare
cp .env.docker.example .env

# Editează .env și schimbă:
# - DB_PASSWORD (parola pentru PostgreSQL)
# - JWT_SECRET (minim 32 caractere random)
```

**Exemplu `.env`:**
```env
DB_NAME=meditutor
DB_USER=postgres
DB_PASSWORD=ParolaSecuritateForte123!

JWT_SECRET=acesta_este_un_secret_foarte_lung_si_complex_pentru_jwt_tokens_12345
```

### Pasul 3: Pornește aplicația

```bash
# Pornește toate serviciile
docker-compose up -d

# Verifică că toate rulează
docker-compose ps
```

### Pasul 4: Accesează aplicația

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Pasul 5: Creează primul cont

1. Deschide http://localhost în browser
2. Click pe "Nu ai cont? Înregistrează-te"
3. Completează:
   - Nume complet
   - Email
   - Parolă (minim 6 caractere)
4. Click "Înregistrare"

✅ Gata! Acum poți folosi platforma!

## 📊 Primii pași în aplicație

### 1. Adaugă primul client (elev)
- Navighează la **Clienți** din sidebar
- Click **Adaugă Client**
- Completează datele elevului

### 2. Programează o ședință
- Mergi la **Ședințe**
- Click **Adaugă Ședință**
- Selectează clientul, data și ora

### 3. Vezi statisticile
- Dashboard-ul afișează automat:
  - Total clienți
  - Ședințe programate
  - Status plăți
  - Programul zilei

## 🛑 Oprire aplicație

```bash
# Oprește serviciile (păstrează datele)
docker-compose down

# Oprește și șterge datele (ATENȚIE!)
docker-compose down -v
```

## 🔄 Restart aplicație

```bash
# Restart toate serviciile
docker-compose restart

# Sau restart individual
docker-compose restart backend
docker-compose restart frontend
```

## 📝 Logs și Debugging

```bash
# Vezi toate logs
docker-compose logs -f

# Vezi logs doar backend
docker-compose logs -f backend

# Vezi logs doar database
docker-compose logs -f db
```

## 💾 Backup Baza de Date

```bash
# Backup
docker exec meditutor-db pg_dump -U postgres meditutor > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20240114.sql | docker exec -i meditutor-db psql -U postgres meditutor
```

## ⚙️ Configurări Avansate

### Schimbă porturile

Editează `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Schimbă 8080 cu portul dorit
  
  backend:
    ports:
      - "3000:5000"  # Schimbă 3000 cu portul dorit
```

### Adaugă mai multă memorie pentru PostgreSQL

```yaml
services:
  db:
    command: postgres -c shared_buffers=256MB -c max_connections=200
```

## 🐛 Probleme Comune

### "Port already in use"
```bash
# Găsește procesul care folosește portul
netstat -ano | findstr :80
# Sau schimbă portul în docker-compose.yml
```

### "Cannot connect to database"
```bash
# Verifică că PostgreSQL rulează
docker-compose ps db

# Restart database
docker-compose restart db

# Vezi logs
docker-compose logs db
```

### "Frontend shows 404 for API calls"
```bash
# Verifică că backend rulează
docker-compose logs backend

# Test health check
curl http://localhost:5000/health
```

## 📱 Acces din Rețea Locală

Pentru a accesa din alte dispozitive în rețeaua ta:

1. Găsește IP-ul calculatorului:
   ```bash
   ipconfig  # Windows
   ```

2. Accesează din alte dispozitive:
   ```
   http://192.168.1.X  (înlocuiește X cu IP-ul tău)
   ```

## 🔐 Securitate Producție

Înainte de a folosi în producție:

1. ✅ Schimbă `JWT_SECRET` cu unul puternic (32+ caractere)
2. ✅ Folosește parolă complexă pentru `DB_PASSWORD`
3. ✅ Activează HTTPS (nginx + Let's Encrypt)
4. ✅ Limitează accesul la porturile PostgreSQL (5432)
5. ✅ Backup regulat baza de date

## 📞 Ajutor

Probleme? Consultă [README.md](README.md) complet sau deschide un issue.

---

**Mult succes! 🎉**
