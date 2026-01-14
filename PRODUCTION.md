# Configurare Producție - MediTutor

Ghid complet pentru deploy în producție.

## 🚀 Deploy cu Docker (Recomandat)

### 1. Pregătire VPS/Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instalează Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalează Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verifică instalarea
docker --version
docker-compose --version
```

### 2. Setup aplicația

```bash
# Clonează/Upload proiectul
cd /opt
git clone <your-repo-url> meditutor
cd meditutor

# SAU: Upload via SCP
# scp -r ./MediTutor user@server:/opt/meditutor

# Configurare .env
cp .env.docker.example .env
nano .env
```

**Editează .env pentru producție:**

```env
# IMPORTANT: Folosește valori SIGURE!
DB_NAME=meditutor
DB_USER=meditutor_user
DB_PASSWORD=ParolaComplexaSiSecurita2024!@#

# JWT Secret - GENEREAZĂ UNO NOU!
# Folosește: openssl rand -hex 32
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
```

### 3. Start servicii

```bash
# Build și start
docker-compose up -d --build

# Verifică status
docker-compose ps

# Vezi logs
docker-compose logs -f
```

### 4. Setup Nginx Reverse Proxy + SSL

```bash
# Instalează Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Configurare Nginx
sudo nano /etc/nginx/sites-available/meditutor
```

**Fișier Nginx config:**

```nginx
# /etc/nginx/sites-available/meditutor

server {
    listen 80;
    server_name meditutor.example.com;  # Schimbă cu domeniul tău

    # Redirect la HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name meditutor.example.com;  # Schimbă cu domeniul tău

    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/meditutor.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meditutor.example.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy to Docker frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeouts for large uploads
        client_max_body_size 20M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Logging
    access_log /var/log/nginx/meditutor_access.log;
    error_log /var/log/nginx/meditutor_error.log;
}
```

**Activează configurația:**

```bash
# Creează symlink
sudo ln -s /etc/nginx/sites-available/meditutor /etc/nginx/sites-enabled/

# Test configurație
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. Setup SSL cu Let's Encrypt

```bash
# Obține certificat SSL (GRATUIT!)
sudo certbot --nginx -d meditutor.example.com

# Certbot va:
# 1. Obține certificatul
# 2. Configura automat Nginx
# 3. Setup auto-renewal

# Verifică renewal automat
sudo certbot renew --dry-run
```

## 🔒 Securitate Producție

### 1. Firewall (UFW)

```bash
# Instalează UFW
sudo apt install ufw

# Permite conexiuni
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Activează firewall
sudo ufw enable

# Verifică status
sudo ufw status
```

### 2. Restricționează accesul PostgreSQL

Editează `docker-compose.yml`:

```yaml
services:
  db:
    # NU expune portul 5432 public!
    # Comentează sau șterge:
    # ports:
    #   - "5432:5432"
    
    # PostgreSQL va fi accesibil DOAR de backend container
```

### 3. Environment Variables Secure

```bash
# NU comite .env în git!
echo ".env" >> .gitignore

# Setează permissions
chmod 600 .env

# Backup .env în loc sigur (encriptat)
```

### 4. Rate Limiting (Nginx)

Adaugă în config Nginx:

```nginx
# Limit request rate
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

server {
    # ...

    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        # ... rest of proxy config
    }

    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        # ... rest of proxy config
    }
}
```

### 5. Fail2Ban pentru SSH

```bash
# Instalează
sudo apt install fail2ban -y

# Configurare
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Activează pentru SSH
[sshd]
enabled = true
maxretry = 3
bantime = 3600

# Restart
sudo systemctl restart fail2ban
```

## 📊 Monitoring

### 1. Setup Log Rotation

```bash
# /etc/logrotate.d/meditutor
/var/log/nginx/meditutor_*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 2. Monitoring Script

Creează `monitor.sh`:

```bash
#!/bin/bash

# Check if services are running
check_service() {
    if docker-compose ps | grep -q "$1.*Up"; then
        echo "✅ $1 is running"
    else
        echo "❌ $1 is DOWN!"
        docker-compose restart $1
    fi
}

check_service "meditutor-db"
check_service "meditutor-backend"
check_service "meditutor-frontend"

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage is above 80%!"
fi

# Check database size
DB_SIZE=$(docker exec meditutor-db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('meditutor'));" -t)
echo "📊 Database size: $DB_SIZE"
```

Adaugă în crontab:

```bash
# Rulează la fiecare 5 minute
*/5 * * * * /opt/meditutor/monitor.sh >> /var/log/meditutor-monitor.log 2>&1
```

## 💾 Backup Automat

### Script Backup

Creează `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/meditutor"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec meditutor-db pg_dump -U postgres meditutor | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/meditutor/backend uploads

# Backup .env
cp /opt/meditutor/.env $BACKUP_DIR/env_$DATE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed: $DATE"
```

Programează backup zilnic:

```bash
# Adaugă în crontab
0 2 * * * /opt/meditutor/backup.sh >> /var/log/meditutor-backup.log 2>&1
```

## 🔄 Update Aplicație

```bash
cd /opt/meditutor

# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Verifică logs
docker-compose logs -f
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Conectează-te la DB
docker exec -it meditutor-db psql -U postgres meditutor

-- Analyze tables
ANALYZE;

-- Vacuum
VACUUM;

-- Reindex
REINDEX DATABASE meditutor;
```

### 2. Nginx Caching

Adaugă în config:

```nginx
# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_cache my_cache;
        proxy_cache_valid 200 1d;
        proxy_cache_valid 404 1m;
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://localhost:80;
    }
}
```

### 3. Docker Resource Limits

Editează `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
  
  db:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 🆘 Troubleshooting Producție

### Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Nginx logs
sudo tail -f /var/log/nginx/meditutor_error.log
```

### Restart servicii

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart backend

# Full rebuild
docker-compose down
docker-compose up -d --build
```

### Database issues

```bash
# Check connections
docker exec meditutor-db psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Kill long queries
docker exec meditutor-db psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < now() - interval '1 hour';"
```

## 📞 Support

Pentru probleme în producție:
1. Verifică logs: `docker-compose logs -f`
2. Verifică resurse: `docker stats`
3. Verifică disk: `df -h`
4. Consultă [README.md](README.md) și [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Succes în producție! 🚀**
