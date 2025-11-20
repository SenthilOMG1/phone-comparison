# MobiMEA Intelligence Platform - Production Deployment Guide

## 🚀 Quick Start (Docker Deployment)

### Prerequisites
- Docker & Docker Compose installed
- Domain name configured (optional)
- PostgreSQL credentials
- Google Gemini API key

### 1. Environment Setup

Create `.env` file in project root:

```bash
# Database
DB_PASSWORD=your_secure_password_here

# API Keys
GEMINI_API_KEY=AIzaSyDvX4y6Blc567p_UdsXPqCUYEaKqAw0DQY
```

### 2. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access the Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📦 Manual Deployment

### Frontend Deployment (Vite + React)

#### Option A: Static Hosting (Vercel/Netlify)

1. **Build for production:**
```bash
npm run build
```

2. **Deploy `dist/` folder to:**
   - **Vercel**: `vercel deploy`
   - **Netlify**: Drag & drop `dist/` folder
   - **AWS S3 + CloudFront**: Upload to S3 bucket

3. **Environment Variables:**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_GEMINI_API_KEY=your_gemini_key
```

#### Option B: Nginx Server

1. **Build:**
```bash
npm run build
```

2. **Copy to nginx:**
```bash
cp -r dist/* /var/www/html/
```

3. **Nginx config** (already created in `nginx.conf`):
```bash
sudo cp nginx.conf /etc/nginx/sites-available/mobimea
sudo ln -s /etc/nginx/sites-available/mobimea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Backend Deployment (FastAPI + PostgreSQL)

#### 1. Database Setup

```bash
# Create database
createdb mobimea_intelligence

# Run migrations
psql mobimea_intelligence < backend/database/schema.sql
```

#### 2. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

#### 3. Configure Environment

Create `backend/.env.production`:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/mobimea_intelligence
GEMINI_API_KEY=your_key
API_HOST=0.0.0.0
API_PORT=8000
```

#### 4. Start Production Server

**With Uvicorn + Gunicorn:**
```bash
pip install gunicorn
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**With PM2 (recommended):**
```bash
npm install -g pm2
pm2 start "uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4" --name mobimea-api
pm2 startup
pm2 save
```

#### 5. Start Scraper Scheduler

```bash
pm2 start "python utils/scheduler.py" --name mobimea-scheduler
```

---

## 🔒 Production Checklist

### Security
- [ ] Change default database password
- [ ] Use HTTPS (SSL certificate with Let's Encrypt)
- [ ] Enable CORS only for production domains
- [ ] Set secure environment variables
- [ ] Enable firewall (ufw/iptables)
- [ ] Use environment-specific API keys

### Performance
- [x] Gzip compression enabled (nginx)
- [x] Static asset caching (1 year)
- [ ] CDN for static assets (optional)
- [ ] Database connection pooling
- [ ] Redis caching (optional)

### Monitoring
- [ ] Set up logging (PM2 logs)
- [ ] Database backups (daily)
- [ ] Health check endpoints (`/health`)
- [ ] Error tracking (Sentry/optional)
- [ ] Uptime monitoring

### Scalability
- [ ] Load balancer (if needed)
- [ ] Database replication (if needed)
- [ ] Auto-scaling (cloud deployment)

---

## 🌐 Cloud Deployment Options

### Option 1: DigitalOcean ($12-25/month)

**1. Create Droplet:**
- OS: Ubuntu 22.04
- Size: Basic ($12/mo - 2GB RAM)
- Add managed PostgreSQL ($15/mo)

**2. Deploy:**
```bash
# SSH into droplet
ssh root@your_droplet_ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repo and deploy
git clone <your-repo>
cd mobimea-intelligence
docker-compose up -d
```

### Option 2: Railway ($5-15/month)

1. Connect GitHub repo
2. Deploy backend (FastAPI)
3. Add PostgreSQL plugin
4. Deploy frontend (Vite) separately
5. Set environment variables in dashboard

### Option 3: AWS (EC2 + RDS)

**EC2 Instance:**
- t2.small ($15/mo)
- Ubuntu Server 22.04

**RDS PostgreSQL:**
- db.t3.micro ($15/mo)

**S3 + CloudFront:**
- Static frontend hosting (~$5/mo)

---

## 📊 Database Management

### Backup

```bash
# Create backup
pg_dump mobimea_intelligence > backup_$(date +%Y%m%d).sql

# Restore backup
psql mobimea_intelligence < backup_20251120.sql
```

### Migrations

Run after schema changes:
```bash
psql mobimea_intelligence < backend/database/schema.sql
```

---

## 🔧 Troubleshooting

### Frontend Issues

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**API connection fails:**
- Check `VITE_API_URL` in `.env.production`
- Verify CORS settings in backend
- Check network/firewall rules

### Backend Issues

**Database connection fails:**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running: `systemctl status postgresql`
- Test connection: `psql -h localhost -U postgres`

**Scraper fails:**
- Install Playwright browsers: `playwright install chromium`
- Check website structure hasn't changed
- Verify anti-bot protection

---

## 📞 Support

For issues, check:
- `docker-compose logs -f` (Docker)
- `pm2 logs` (PM2)
- Browser console (F12)
- Backend logs: `tail -f backend/logs/app.log`

---

## 🎯 Production URLs

After deployment, update these in your code:

**Frontend `.env.production`:**
```bash
VITE_API_URL=https://api.mobimea.mu
```

**Backend CORS settings:**
```python
# backend/api/demo_api.py or backend/api/main.py
allow_origins=["https://mobimea.mu", "https://www.mobimea.mu"]
```

---

## 🚦 Deployment Status

Current status: **Development** → Moving to **Production**

**Completed:**
- ✅ Production build configuration
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ Environment configuration
- ✅ Multi-stage Docker builds
- ✅ Health checks

**Next Steps:**
1. Choose hosting provider
2. Configure domain & SSL
3. Deploy & test
4. Set up monitoring
5. Configure backups
