# MobiMEA Intelligence Platform - Deployment Guide

## Overview

This guide covers deploying the MobiMEA platform to production using Docker or manual deployment.

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 20GB+ disk space

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd phone-com
```

2. **Configure environment variables**
```bash
# Create .env file in project root
cp .env.example .env

# Edit .env with your values
nano .env
```

Required environment variables:
```env
DB_PASSWORD=your_secure_postgres_password
GEMINI_API_KEY=your_gemini_api_key
```

3. **Start all services**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL + TimescaleDB (port 5432)
- Backend API (port 8000)
- Frontend (port 5177)
- Scraper Scheduler (background)

4. **Verify services**
```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Check backend health
curl http://localhost:8000/api/dashboard/stats

# Check frontend
open http://localhost:5177
```

5. **Initialize database**
```bash
# Database schema is auto-loaded on first start
# To manually run schema:
docker-compose exec database psql -U postgres -d mobimea_intelligence -f /docker-entrypoint-initdb.d/schema.sql
```

6. **Run first scrape**
```bash
docker-compose exec backend python scrapers/scraper_orchestrator.py
```

### Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart a service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend python test_scraper.py

# Update and rebuild
git pull
docker-compose up -d --build
```

---

## 🌐 Production Deployment (DigitalOcean/Railway)

### Option A: DigitalOcean Droplet

**Cost: ~$27/month**
- Droplet: $12/month (2GB RAM, 1 CPU)
- Managed PostgreSQL: $15/month

**Steps:**

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - Enable backups

2. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose
```

3. **Set up database**
   - Create Managed PostgreSQL database in DigitalOcean
   - Enable TimescaleDB extension
   - Note connection details

4. **Deploy application**
```bash
git clone <repository-url>
cd phone-com

# Create .env
cat > .env << EOF
DB_PASSWORD=your_password
GEMINI_API_KEY=your_key
DATABASE_URL=postgresql://user:pass@host:port/dbname
EOF

# Start services
docker-compose up -d

# Set up nginx reverse proxy (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/mobimea
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5177;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Enable SSL**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

6. **Set up auto-start**
```bash
# Create systemd service
sudo nano /etc/systemd/system/mobimea.service
```

```ini
[Unit]
Description=MobiMEA Intelligence Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/phone-com
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable mobimea
sudo systemctl start mobimea
```

### Option B: Railway.app

**Cost: ~$10-20/month** (usage-based)

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize project**
```bash
railway init
railway link
```

3. **Add PostgreSQL**
```bash
railway add postgresql
```

4. **Deploy backend**
```bash
cd backend
railway up
```

5. **Deploy frontend**
```bash
cd ..
railway up
```

6. **Set environment variables**
   - Go to Railway dashboard
   - Add GEMINI_API_KEY
   - DATABASE_URL is auto-configured

---

## 📱 Frontend Deployment (Vercel/Netlify)

### Vercel (Recommended for Frontend)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd phone-com
vercel --prod
```

3. **Configure environment variables in Vercel dashboard**
   - `VITE_API_URL`: Your backend URL
   - `VITE_GEMINI_API_KEY`: Your Gemini key

### Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build and deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔧 Manual Deployment (No Docker)

### Backend Setup

1. **Install Python 3.11+**
```bash
sudo apt install python3.11 python3.11-venv
```

2. **Create virtual environment**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

3. **Install PostgreSQL with TimescaleDB**
```bash
sudo apt install postgresql-15
sudo apt install timescaledb-postgresql-15
sudo -u postgres psql -c "CREATE DATABASE mobimea_intelligence;"
sudo -u postgres psql mobimea_intelligence < database/schema.sql
```

4. **Configure environment**
```bash
cp .env.example .env
nano .env
```

5. **Start API**
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

6. **Set up scheduler as systemd service**
```bash
sudo nano /etc/systemd/system/mobimea-scheduler.service
```

```ini
[Unit]
Description=MobiMEA Scraper Scheduler
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mobimea/backend
Environment="PATH=/var/www/mobimea/backend/venv/bin"
ExecStart=/var/www/mobimea/backend/venv/bin/python utils/scheduler.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable mobimea-scheduler
sudo systemctl start mobimea-scheduler
```

### Frontend Setup

1. **Install Node.js 20+**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

2. **Build frontend**
```bash
npm install
npm run build
```

3. **Serve with nginx**
```bash
sudo cp -r dist/* /var/www/html/
```

---

## 🔐 Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Enable SSL/TLS for API
- [ ] Set up firewall rules (ufw/iptables)
- [ ] Restrict database access to backend only
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for frontend domain
- [ ] Set up regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use strong Gemini API key

---

## 📊 Monitoring

### Health Checks

```bash
# Backend API
curl http://localhost:8000/api/dashboard/stats

# Database
docker-compose exec database pg_isready

# Scraper logs
curl http://localhost:8000/api/scrapers/logs
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f scheduler

# Manual deployment logs
journalctl -u mobimea-scheduler -f
tail -f /var/log/nginx/access.log
```

---

## 🔄 Maintenance

### Database Backups

```bash
# Automated daily backup
cat > /etc/cron.daily/mobimea-backup << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T database pg_dump -U postgres mobimea_intelligence > /backups/mobimea_$DATE.sql
find /backups -name "mobimea_*.sql" -mtime +7 -delete
EOF

chmod +x /etc/cron.daily/mobimea-backup
```

### Updates

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or without Docker
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart mobimea-api mobimea-scheduler
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend python -c "from database.db_manager import DatabaseManager; DatabaseManager()"
```

### Scrapers failing
```bash
# Test individual scraper
docker-compose exec backend python scrapers/courts_scraper.py

# Check Playwright installation
docker-compose exec backend playwright install chromium
```

### Database connection issues
```bash
# Check database is running
docker-compose ps database

# Test connection
docker-compose exec database psql -U postgres -d mobimea_intelligence -c "SELECT 1;"
```

---

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review error messages
3. Verify environment variables
4. Check network connectivity
5. Consult PROJECT_SUMMARY.md and README files

---

## 💰 Cost Estimate

**Development/Small Scale:**
- DigitalOcean: $27/month
- Railway: $10-20/month
- Vercel (frontend): Free tier

**Production/Medium Scale:**
- DigitalOcean: $50-100/month (4GB droplet + managed DB)
- Railway: $30-50/month
- Gemini API: $5-20/month (depending on usage)

**Total: $35-120/month depending on scale**
