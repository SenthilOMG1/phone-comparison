# Single Instance Deployment - Everything on Lightsail

**Both Frontend + Backend on ONE Lightsail Instance**

---

## Architecture

```
User → Lightsail Instance
        ├── Nginx (Web Server)
        │   ├── Frontend (React - Port 80/443)
        │   └── Proxy to Backend (FastAPI - Port 8000)
        └── Backend API (Python FastAPI)
            └── Supabase (Database)
```

**Everything runs on ONE $12/month Lightsail instance**

---

## Cost

- Lightsail: **$12/month** (2 GB RAM, 2 vCPUs, 60 GB SSD)
- Total: **$12/month** ✨

No S3, no CloudFront needed!

---

## Step-by-Step Deployment

### Step 1: Create Lightsail Instance (2 minutes)

**In AWS Lightsail Console (where you are now):**

1. **Platform**: Linux/Unix
2. **Blueprint**: OS only → **Ubuntu 22.04 LTS**
3. **Instance Plan**: **$12/month** (2 GB RAM, 2 vCPUs)
4. **Region**: Singapore (ap-southeast-1) - closest to Mauritius
5. **Instance Name**: `mobimea-app`
6. Click **Create instance**

Wait 2-3 minutes for it to start.

### Step 2: Configure Firewall (1 minute)

**In Lightsail Console:**

1. Go to your instance → **Networking** tab
2. Scroll to **IPv4 Firewall**
3. Add rules:
   - HTTP: Port **80**, TCP, Source: Anywhere (0.0.0.0/0)
   - HTTPS: Port **443**, TCP, Source: Anywhere (0.0.0.0/0)
   - API: Port **8000**, TCP, Source: Anywhere (0.0.0.0/0)
4. Click **Create**

### Step 3: Connect to Instance (1 minute)

**Click the orange "Connect using SSH" button** in Lightsail console.

Or use your terminal:
```bash
ssh ubuntu@YOUR_INSTANCE_IP
```

### Step 4: Install Dependencies (3 minutes)

**Run these commands in SSH:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (for building frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Nginx (web server)
sudo apt install -y nginx

# Install Docker (for backend)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Log out and back in for Docker permissions
exit
```

**Reconnect via SSH** (click button again or ssh again)

### Step 5: Clone Your Code (1 minute)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/mobimea.git
cd mobimea

# Or upload files manually
# You can use: scp, rsync, or FileZilla
```

If you don't have it on GitHub yet:
```bash
# Create directory
mkdir -p ~/mobimea

# You'll need to upload your files
# Use FileZilla or SCP from your local machine
```

From your **local machine** (Windows):
```bash
# Upload all files
scp -r "C:\Users\sedric\Desktop\phone com" ubuntu@YOUR_LIGHTSAIL_IP:~/mobimea/
```

### Step 6: Deploy Backend (5 minutes)

```bash
cd ~/mobimea/backend

# Create .env file
nano .env
```

**Add to .env:**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSyDvX4y6Blc567p_UdsXPqCUYEaKqAw0DQY
FRONTEND_URL=http://YOUR_LIGHTSAIL_IP
PORT=8000
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# Build Docker image
docker build -t mobimea-backend .

# Run backend container
docker run -d \
  --name mobimea-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  mobimea-backend

# Check if running
docker ps
docker logs mobimea-backend

# Test backend
curl http://localhost:8000/api/health
```

Should return: `{"status":"healthy"}`

### Step 7: Build Frontend (3 minutes)

```bash
cd ~/mobimea

# Install dependencies
npm install

# Build frontend (with backend URL pointing to same server)
VITE_API_URL=http://YOUR_LIGHTSAIL_IP:8000 npm run build

# Check build output
ls -lh dist/
```

You should see `dist/` folder with built files.

### Step 8: Configure Nginx (5 minutes)

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mobimea
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_LIGHTSAIL_IP;

    # Frontend - Serve React app
    location / {
        root /home/ubuntu/mobimea/dist;
        try_files $uri $uri/ /index.html;

        # Add cache headers for static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to FastAPI
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mobimea /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 9: Update Frontend API URL (2 minutes)

Since frontend and backend are on same server, update API URL:

```bash
cd ~/mobimea

# Rebuild with correct API URL (same domain)
VITE_API_URL=/api npm run build

# Nginx will proxy /api/* to backend at :8000
```

### Step 10: Test Everything (2 minutes)

```bash
# Get your public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Test backend directly
curl http://localhost:8000/api/health

# Test through Nginx proxy
curl http://YOUR_LIGHTSAIL_IP/api/health
```

**Open in browser:**
```
http://YOUR_LIGHTSAIL_IP
```

You should see your React app! 🎉

---

## Setup SSL/HTTPS (Optional - 5 minutes)

### Option A: Using Caddy (Easiest - Automatic SSL)

```bash
# Stop Nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy
sudo nano /etc/caddy/Caddyfile
```

**Add to Caddyfile:**
```
yourdomain.com {
    root * /home/ubuntu/mobimea/dist
    file_server
    try_files {path} /index.html

    reverse_proxy /api/* localhost:8000
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy

# Caddy will automatically get SSL certificate!
```

### Option B: Using Certbot with Nginx

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Certbot will automatically configure Nginx for HTTPS!
```

---

## Deployment Script for Updates

Create `deploy.sh`:

```bash
nano ~/deploy.sh
```

**Add:**
```bash
#!/bin/bash

echo "🚀 Deploying MobiMEA..."

cd ~/mobimea

# Pull latest code
git pull origin main

# Rebuild frontend
VITE_API_URL=/api npm run build

# Restart backend
docker restart mobimea-backend

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "📱 Frontend: http://YOUR_LIGHTSAIL_IP"
echo "🔧 Backend: http://YOUR_LIGHTSAIL_IP/api/health"
```

Make executable:
```bash
chmod +x ~/deploy.sh
```

**Use it:**
```bash
./deploy.sh
```

---

## Monitoring

### View Backend Logs

```bash
# Docker logs
docker logs -f mobimea-backend

# Last 100 lines
docker logs --tail 100 mobimea-backend
```

### View Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### System Resources

```bash
# CPU and memory
htop

# Or simpler
top

# Disk space
df -h
```

---

## Backup

### Create Snapshot (Manual)

1. Lightsail Console → Instance → Snapshots
2. Click "Create snapshot"
3. Name: `mobimea-backup-2025-11-21`
4. Click Create

**Cost**: ~$0.05/GB per month

### Automatic Snapshots

1. Lightsail Console → Instance → Snapshots tab
2. Enable automatic snapshots
3. Select time: 2 AM (low traffic)

---

## File Structure on Server

```
/home/ubuntu/
├── mobimea/
│   ├── dist/                    # Built frontend (served by Nginx)
│   ├── backend/
│   │   ├── .env                 # Environment variables
│   │   ├── Dockerfile
│   │   └── api/
│   ├── src/                     # Frontend source
│   └── package.json
└── deploy.sh                    # Deployment script
```

---

## Troubleshooting

### Frontend not loading

```bash
# Check Nginx
sudo systemctl status nginx

# Check permissions
ls -la ~/mobimea/dist/

# Rebuild frontend
cd ~/mobimea
VITE_API_URL=/api npm run build
sudo systemctl restart nginx
```

### Backend not working

```bash
# Check Docker container
docker ps
docker logs mobimea-backend

# Restart backend
docker restart mobimea-backend

# Check if listening on port 8000
sudo netstat -tulpn | grep 8000
```

### API calls failing

```bash
# Test backend directly
curl http://localhost:8000/api/health

# Test through Nginx
curl http://YOUR_LIGHTSAIL_IP/api/health

# Check Nginx proxy config
sudo nginx -t
sudo systemctl restart nginx
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean old logs
sudo journalctl --vacuum-time=7d
```

### High memory usage

```bash
# Check what's using memory
free -h
docker stats

# Restart services
docker restart mobimea-backend
sudo systemctl restart nginx
```

---

## Scaling Options

### Upgrade Instance Size

1. Lightsail Console → Instance → Stop instance
2. Manage → Change plan
3. Select $24 or $44/month plan
4. Start instance

### Add CDN Later (Keep Backend on Lightsail)

If you want global speed later:

1. Keep backend on Lightsail
2. Move frontend to CloudFront:
   ```bash
   # Build frontend
   npm run build

   # Upload to S3
   aws s3 sync dist/ s3://mobimea-frontend

   # Create CloudFront distribution
   ```

---

## Domain Setup (Optional)

### Point Domain to Lightsail

1. **Create Static IP** (free!):
   - Lightsail Console → Networking → Create static IP
   - Attach to instance

2. **Update DNS**:
   - Go to your domain registrar
   - Add A record: `yourdomain.com` → `YOUR_STATIC_IP`
   - Add A record: `www.yourdomain.com` → `YOUR_STATIC_IP`

3. **Update Nginx config**:
   ```bash
   sudo nano /etc/nginx/sites-available/mobimea
   ```

   Change:
   ```nginx
   server_name YOUR_LIGHTSAIL_IP;
   ```

   To:
   ```nginx
   server_name yourdomain.com www.yourdomain.com;
   ```

   ```bash
   sudo systemctl restart nginx
   ```

4. **Add SSL**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Lightsail Instance ($12 plan) | $12.00/month |
| Static IP | FREE |
| Data Transfer (3 TB included) | FREE |
| **Total** | **$12/month** |

---

## Pros & Cons

### Pros ✅
- Simple setup (everything in one place)
- Lowest cost ($12/month total)
- Easy to debug (SSH access)
- No complex networking

### Cons ⚠️
- Not globally distributed (slower for distant users)
- Single point of failure
- Frontend not cached at edge
- Manual scaling

---

## When to Separate Frontend/Backend

Upgrade to separate hosting when:
- Traffic grows significantly (10,000+ users/month)
- Users complain about speed from distant locations
- Need global CDN
- Need auto-scaling

Then move to:
- Backend: Keep on Lightsail or migrate to ECS
- Frontend: Move to CloudFront/Netlify for global speed

---

## Quick Commands Reference

```bash
# Deploy updates
./deploy.sh

# View backend logs
docker logs -f mobimea-backend

# View nginx logs
sudo tail -f /var/log/nginx/access.log

# Restart backend
docker restart mobimea-backend

# Restart nginx
sudo systemctl restart nginx

# Check disk space
df -h

# Check memory
free -h

# System resources
htop
```

---

## Summary

✅ **Single Lightsail instance** ($12/month)
✅ **Frontend**: Served by Nginx (port 80/443)
✅ **Backend**: Docker container (port 8000)
✅ **Database**: Supabase (external)

**Total Setup Time**: 20-25 minutes
**Monthly Cost**: $12
**URL**: http://YOUR_LIGHTSAIL_IP

---

🚀 **Ready to Deploy!**

Go back to Lightsail console and create your instance!
Then follow the steps above step-by-step.

**Next Step**: Click "Create instance" in Lightsail! ✨
