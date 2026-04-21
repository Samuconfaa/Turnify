# Deployment — Turnify su VPS Linux

**Versione:** 1.0  
**Target:** VPS Ubuntu 22.04 LTS  
**Stack:** Nginx + ASP.NET Core + PostgreSQL + Let's Encrypt

---

## 1. Requisiti VPS

| Risorsa | Minimo (MVP) | Consigliato |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Banda | 1 Gbps | 1 Gbps |

Provider consigliati per PMI italiane: Hetzner, Contabo, OVH, DigitalOcean.

---

## 2. Architettura di Deployment

```
Internet (HTTPS :443)
         │
    ┌────▼────┐
    │  Nginx  │  ← Reverse proxy, SSL termination, static files
    └────┬────┘
         │ HTTP interno :5000
    ┌────▼──────────┐
    │ ASP.NET Core  │  ← systemd service (turnify-api.service)
    │  Web API      │
    └────┬──────────┘
         │ TCP :5432 (localhost)
    ┌────▼──────┐
    │ PostgreSQL│  ← Solo localhost, non esposto
    └───────────┘
```

---

## 3. Setup Iniziale Server

### 3.1 Aggiornamento sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip ufw
```

### 3.2 Configurazione Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh        # porta 22
sudo ufw allow 80/tcp     # HTTP (per certbot)
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
sudo ufw status
```

### 3.3 Creazione utente applicazione
```bash
sudo useradd -m -s /bin/bash turnify
sudo usermod -aG sudo turnify
```

---

## 4. Installazione .NET Runtime

```bash
# Aggiunge il repository Microsoft
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update

# Installa solo il runtime (non il full SDK in produzione)
sudo apt install -y aspnetcore-runtime-8.0
dotnet --info  # verifica installazione
```

---

## 5. Installazione e Configurazione PostgreSQL

### 5.1 Installazione
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 5.2 Creazione database e utente
```bash
sudo -u postgres psql
```

```sql
CREATE USER turnify_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE turnify_db OWNER turnify_user;
GRANT ALL PRIVILEGES ON DATABASE turnify_db TO turnify_user;
\q
```

### 5.3 Sicurezza PostgreSQL
- PostgreSQL in ascolto solo su `localhost` (default)
- Verificare `/etc/postgresql/15/main/postgresql.conf`: `listen_addresses = 'localhost'`
- Nessuna porta esposta verso internet

---

## 6. Deploy Applicazione ASP.NET Core

### 6.1 Pubblicazione (da macchina di sviluppo)
```bash
dotnet publish ./src/Turnify.Api -c Release -r linux-x64 --self-contained false -o ./publish
```

### 6.2 Trasferimento su VPS
```bash
scp -r ./publish/* turnify@tuovps.com:/home/turnify/app/
```

### 6.3 Configurazione variabili d'ambiente
Creare il file `/home/turnify/app/appsettings.Production.json` **sul server** (mai nel repo):

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=turnify_db;Username=turnify_user;Password=STRONG_PASSWORD"
  },
  "Jwt": {
    "Secret": "ALMENO_32_CARATTERI_RANDOM_QUI_DA_GENERARE",
    "Issuer": "https://api.turnify.it",
    "Audience": "turnify-mobile-app",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 6.4 Configurazione systemd service
Creare `/etc/systemd/system/turnify-api.service`:

```ini
[Unit]
Description=Turnify API Service
After=network.target postgresql.service

[Service]
Type=simple
User=turnify
WorkingDirectory=/home/turnify/app
ExecStart=/usr/bin/dotnet /home/turnify/app/Turnify.Api.dll
Restart=on-failure
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable turnify-api
sudo systemctl start turnify-api
sudo systemctl status turnify-api  # verifica che sia running
```

---

## 7. Configurazione Nginx

### 7.1 Installazione
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

### 7.2 Virtual host `/etc/nginx/sites-available/turnify-api`

```nginx
server {
    listen 80;
    server_name api.turnify.it;

    # Redirect tutto su HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.turnify.it;

    ssl_certificate     /etc/letsencrypt/live/api.turnify.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.turnify.it/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Header di sicurezza
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header Referrer-Policy no-referrer;

    # Proxy verso ASP.NET Core
    location / {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout
        proxy_connect_timeout 60s;
        proxy_read_timeout    60s;
    }

    # Limita dimensione corpo richiesta
    client_max_body_size 10M;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/turnify-api /etc/nginx/sites-enabled/
sudo nginx -t  # verifica configurazione
sudo systemctl reload nginx
```

---

## 8. SSL con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.turnify.it
```

Certbot configura automaticamente il rinnovo. Verificare:
```bash
sudo certbot renew --dry-run  # test rinnovo automatico
```

Il rinnovo automatico è gestito da un timer systemd (verificare con `systemctl list-timers | grep certbot`).

---

## 9. Migrazioni Database

```bash
# Da eseguire sul server dopo ogni deploy
cd /home/turnify/app
dotnet ef database update --connection "connstring" 
# oppure: la migration viene applicata automaticamente all'avvio se configurata
```

**Consiglio:** configurare l'app per applicare le migrazioni pendenti automaticamente all'avvio in produzione (opzione `MigrateOnStartup = true`).

---

## 10. Backup Automatico

Script `/home/turnify/scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/turnify/backups"
DB_NAME="turnify_db"
DB_USER="turnify_user"

mkdir -p $BACKUP_DIR
PGPASSWORD="$DB_PASSWORD" pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Mantieni solo gli ultimi 30 backup
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completato: backup_$DATE.sql.gz"
```

Cron job (`crontab -e` come utente turnify):
```
0 2 * * * /home/turnify/scripts/backup.sh >> /home/turnify/logs/backup.log 2>&1
```

---

## 11. Monitoraggio

- **UptimeRobot** (gratuito): monitoring HTTPS ogni 5 minuti, notifica email se down
- **Endpoint salute:** `GET /health` → risponde `200 OK` se API e DB sono raggiungibili
- **Log applicazione:** `/home/turnify/logs/` — consultare in caso di errori

---

## 12. Procedura di Deploy Aggiornamento

```bash
# 1. Backup preventivo
/home/turnify/scripts/backup.sh

# 2. Deploy nuova versione
scp -r ./publish/* turnify@tuovps.com:/home/turnify/app-new/
ssh turnify@tuovps.com

# 3. Swap atomico e riavvio servizio
mv /home/turnify/app /home/turnify/app-old
mv /home/turnify/app-new /home/turnify/app
sudo systemctl restart turnify-api
sleep 5
curl -f https://api.turnify.it/health && echo "Deploy OK" || echo "ERRORE - rollback!"

# 4. In caso di errore: rollback
# sudo systemctl stop turnify-api
# mv /home/turnify/app /home/turnify/app-failed
# mv /home/turnify/app-old /home/turnify/app
# sudo systemctl start turnify-api
```

---

## 13. CI/CD Futuro (v2.0)

Il processo di deploy attuale è manuale. Nella roadmap è prevista l'automazione con:

- **pipeline CI:** build, test, pubblicazione artefatto al merge su `main`
- **Deploy automatico:** trasferimento su VPS e riavvio servizio via SSH
- **Environment staging:** deploy automatico su staging, deploy produzione manuale con approvazione
