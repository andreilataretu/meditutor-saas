# Ghid de Migrare de la Lovable Cloud/Supabase la Self-Hosted

Acest ghid te ajută să migrezi datele existente din Lovable Cloud (Supabase) către noua platformă self-hosted.

## 📋 Pregătire

### 1. Export date din Supabase

#### Opțiunea A: Export SQL (Recomandat)

```bash
# Conectează-te la Supabase Dashboard
# Mergi la SQL Editor și rulează:

-- Export users (adaptează pentru auth.users)
COPY (
  SELECT email, raw_user_meta_data->>'full_name' as full_name, created_at
  FROM auth.users
) TO STDOUT WITH CSV HEADER;

-- Export clients
COPY clients TO STDOUT WITH CSV HEADER;

-- Export sessions
COPY sessions TO STDOUT WITH CSV HEADER;

-- Export client_notes
COPY client_notes TO STDOUT WITH CSV HEADER;

-- ... (repetă pentru toate tabelele)
```

#### Opțiunea B: Folosește Supabase API

Creează un script pentru export:

```javascript
// export-supabase.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SERVICE_KEY');

async function exportTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) throw error;
  
  fs.writeFileSync(
    `${tableName}.json`,
    JSON.stringify(data, null, 2)
  );
  console.log(`✅ Exported ${tableName}: ${data.length} records`);
}

async function exportAll() {
  const tables = [
    'clients',
    'sessions', 
    'client_notes',
    'client_grades',
    'client_objectives',
    'session_journals',
    'client_advance_payments',
    'client_rate_history',
    'materials'
  ];
  
  for (const table of tables) {
    await exportTable(table);
  }
}

exportAll().catch(console.error);
```

Rulează:
```bash
node export-supabase.js
```

### 2. Export fișiere din Supabase Storage

```javascript
// export-storage.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import https from 'https';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SERVICE_KEY');

async function downloadFile(path, localPath) {
  const { data } = await supabase.storage
    .from('materials')
    .download(path);
  
  const buffer = await data.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(buffer));
}

async function exportStorage() {
  const { data: files } = await supabase.storage
    .from('materials')
    .list();
  
  for (const file of files) {
    await downloadFile(file.name, `./materials-backup/${file.name}`);
    console.log(`✅ Downloaded: ${file.name}`);
  }
}

exportStorage().catch(console.error);
```

## 🔄 Import în Self-Hosted

### 1. Pornește platforma self-hosted

```bash
# Start Docker containers
docker-compose up -d

# Verifică că PostgreSQL rulează
docker-compose ps
```

### 2. Creează cont admin

Accesează `http://localhost` și înregistrează primul cont (va fi admin-ul).

### 3. Import date

#### Opțiunea A: Script automat de import

Creează `import-data.js`:

```javascript
import fs from 'fs';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
let authToken = '';

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@example.com',  // Contul tău nou
    password: 'parola123'
  });
  authToken = response.data.token;
}

async function importClients() {
  const clients = JSON.parse(fs.readFileSync('clients.json'));
  
  for (const client of clients) {
    try {
      await axios.post(`${API_URL}/clients`, {
        studentName: client.student_name,
        parentName: client.parent_name,
        studentPhone: client.student_phone,
        parentPhone: client.parent_phone,
        grade: client.grade,
        subject: client.subject,
        rate: client.rate,
        status: client.status
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Imported client: ${client.student_name}`);
    } catch (error) {
      console.error(`❌ Failed: ${client.student_name}`, error.message);
    }
  }
}

async function importSessions() {
  const sessions = JSON.parse(fs.readFileSync('sessions.json'));
  
  // IMPORTANT: Trebuie să mapezi vechile client_id la noile UUID-uri
  const clientMapping = {}; // { old_id: new_id }
  
  for (const session of sessions) {
    try {
      await axios.post(`${API_URL}/sessions`, {
        clientId: clientMapping[session.client_id], // Mapare veche -> nouă
        sessionDate: session.session_date,
        sessionTime: session.session_time,
        description: session.description,
        paymentStatus: session.payment_status
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Imported session: ${session.id}`);
    } catch (error) {
      console.error(`❌ Failed session: ${session.id}`, error.message);
    }
  }
}

async function main() {
  await login();
  await importClients();
  await importSessions();
  // ... importă și celelalte tabele
}

main().catch(console.error);
```

Rulează:
```bash
node import-data.js
```

#### Opțiunea B: Import direct în PostgreSQL

```bash
# Conectează-te la container
docker exec -it meditutor-db psql -U postgres meditutor

# Import din CSV
\COPY clients(student_name, parent_name, ...) FROM 'clients.csv' CSV HEADER;
```

### 4. Import fișiere materiale

```bash
# Copiază fișierele în directorul uploads
docker cp ./materials-backup/. meditutor-backend:/app/uploads/

# Sau dacă rulezi local:
cp -r ./materials-backup/* ./backend/uploads/
```

### 5. Actualizează referințele către fișiere

Rulează un script SQL pentru a actualiza path-urile:

```sql
-- Adaptează path-urile pentru noul sistem
UPDATE materials 
SET file_path = '/uploads/' || filename
WHERE file_path IS NOT NULL;
```

## ⚠️ Atenție la Diferențe

### 1. UUID-uri diferite
- Supabase generează UUID-uri diferite
- Trebuie să mapezi vechile ID-uri la noile ID-uri
- Păstrează un mapping în timpul importului

### 2. Timestamps
- Verifică fusul orar - Supabase folosește UTC
- Ajustează dacă e necesar

### 3. Auth
- Parolele NU pot fi migrate (sunt hash-ate diferit)
- Utilizatorii trebuie să își reseteze parolele
- SAU: Trimite email cu link de setup

### 4. Storage paths
- Supabase Storage folosește bucket-uri
- Self-hosted folosește directorul local `/uploads`
- Actualizează toate referințele

## 🔍 Verificare Post-Migrare

### Checklist

- [ ] Toți clienții au fost importați
- [ ] Toate ședințele sunt prezente
- [ ] Notele CRM sunt complete
- [ ] Materiale didactice sunt accesibile
- [ ] Statisticile se calculează corect
- [ ] Nu există erori în logs

### Comenzi de verificare

```bash
# Verifică logs
docker-compose logs backend

# Numără înregistrările
docker exec -it meditutor-db psql -U postgres meditutor -c "
  SELECT 
    (SELECT COUNT(*) FROM clients) as clients,
    (SELECT COUNT(*) FROM sessions) as sessions,
    (SELECT COUNT(*) FROM materials) as materials;
"

# Test API
curl http://localhost:5000/health
```

## 📊 Comparație Înainte/După

Creează un raport de comparație:

```sql
-- În vechea bază (Supabase)
SELECT 
  'clients' as table_name, 
  COUNT(*) as count 
FROM clients
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
-- ...

-- În noua bază (Self-hosted)
-- Repetă aceleași queries și compară rezultatele
```

## 🆘 Probleme Comune

### Import eșuează cu "foreign key constraint"

**Soluție**: Importă în ordinea corectă:
1. Users (authentication)
2. Clients
3. Sessions (depinde de clients)
4. Restul tabelelor

### Fișierele nu se încarcă

**Verifică**:
```bash
# Permissions
docker exec meditutor-backend ls -la /app/uploads

# Dacă e nevoie:
docker exec meditutor-backend chmod -R 755 /app/uploads
```

### Eroare "user_id not found"

**Cauză**: UUID-urile sunt diferite în noul sistem.

**Soluție**: Toate datele trebuie importate pentru USER-ul nou creat, nu cu vechile UUID-uri.

## 🎯 Best Practices

1. **Backup mai întâi**: Înainte de orice, backup complet Supabase
2. **Test pe date mici**: Testează procesul pe 10-20 înregistrări
3. **Validează**: Verifică fiecare import înainte de următorul
4. **Logs**: Păstrează logs detaliate ale importului
5. **Rollback plan**: Ai un plan de rollback dacă ceva merge prost

## 📞 Ajutor

Dacă întâmpini probleme:
1. Verifică [QUICKSTART.md](QUICKSTART.md)
2. Verifică logs: `docker-compose logs -f`
3. Consultă [API.md](API.md) pentru endpoint-uri
4. Deschide un issue cu detalii despre eroare

---

**Mult succes cu migrarea! 🚀**
