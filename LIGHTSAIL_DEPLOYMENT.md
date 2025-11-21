# AWS Lightsail Deployment - Simplified Guide

**Simpler, Cheaper Alternative to ECS**

---

## Why Lightsail?

- ✅ **Simpler**: No VPC, subnets, load balancers
- ✅ **Cheaper**: $12/month (vs $30+ for ECS)
- ✅ **Fixed Price**: Predictable costs
- ✅ **Easier Setup**: 10 minutes vs 30 minutes
- ✅ **Perfect for**: Small to medium traffic

---

## Architecture

```
User → CloudFront → S3 (Frontend)
         ↓
    Lightsail Instance (Backend)
         ↓
    Supabase (Database)
```

**Total Cost**: ~$14/month
- Lightsail: $12/month
- S3 + CloudFront: ~$2/month

---

## Step-by-Step Deployment

### Part 1: Backend (Lightsail)

#### 1. Create Lightsail Instance

**In AWS Console:**

1. Go to: https://lightsail.aws.amazon.com/
2. Click "Create instance"
3. **Location**: Singapore (ap-southeast-1) - closest to Mauritius
4. **Platform**: Linux/Unix
5. **Blueprint**:
   - Select "OS only" tab
   - Choose **Ubuntu 22.04 LTS**
6. **Instance Plan**: **$12/month** (2 GB RAM, 2 vCPUs, 60 GB SSD)
7. **Instance Name**: `mobimea-backend`
8. Click "Create instance"

Wait 2-3 minutes for instance to start.

#### 2. Connect to Instance

```bash
# Option A: Use browser-based SSH (easiest)
# Click "Connect using SSH" button in Lightsail console

# Option B: Use your terminal
# Download SSH key from Lightsail → Account → SSH keys
chmod 400 LightsailDefaultKey-ap-southeast-1.pem
ssh -i LightsailDefaultKey-ap-southeast-1.pem ubuntu@YOUR_INSTANCE_IP
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Docker (for easier deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

**Log out and back in** for Docker permissions.

#### 4. Deploy Backend

##### Option A: Direct Deployment

```bash
# Clone your repo (or upload files)
git clone https://github.com/YOUR_USERNAME/mobimea.git
cd mobimea/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium
playwright install-deps chromium

# Create .env file
nano .env
```

Add to `.env`:
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.project.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSyDvX4y6Blc567p_UdsXPqCUYEaKqAw0DQY
FRONTEND_URL=https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
PORT=8000
```

```bash
# Install PM2 for process management
sudo npm install -g pm2

# Start backend
pm2 start "uvicorn api.main:app --host 0.0.0.0 --port 8000" --name mobimea-backend

# Save PM2 configuration
pm2 save
pm2 startup
# Follow the command PM2 gives you

# Check status
pm2 status
pm2 logs mobimea-backend
```

##### Option B: Docker Deployment (Recommended)

```bash
# Upload your code
git clone https://github.com/YOUR_USERNAME/mobimea.git
cd mobimea/backend

# Build Docker image
docker build -t mobimea-backend .

# Create .env file
nano .env

# Run container
docker run -d \
  --name mobimea-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  mobimea-backend

# Check status
docker ps
docker logs mobimea-backend
```

#### 5. Configure Firewall

In **Lightsail Console**:

1. Go to instance → Networking tab
2. Scroll to "IPv4 Firewall"
3. Add rule:
   - **Application**: Custom
   - **Protocol**: TCP
   - **Port**: 8000
   - **Source**: Anywhere (0.0.0.0/0)
4. Click "Create"

#### 6. Get Backend URL

```bash
# Get public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Your backend URL:
http://YOUR_PUBLIC_IP:8000
```

Test it:
```bash
curl http://YOUR_PUBLIC_IP:8000/api/health
```

### Part 2: Frontend (S3 + CloudFront)

Use the same process as before:

```bash
# Set backend URL
export VITE_API_URL=http://YOUR_LIGHTSAIL_IP:8000

# Build frontend
npm run build

# Deploy to S3
./scripts/deploy-frontend.sh
```

---

## SSL/HTTPS Setup (Optional but Recommended)

### Option 1: Use Cloudflare (Easiest, Free)

1. Sign up at cloudflare.com
2. Add your domain
3. Create DNS A record pointing to Lightsail IP
4. Enable "Flexible SSL" in Cloudflare
5. Your backend: `https://api.yourdomain.com`

### Option 2: Install Let's Encrypt on Lightsail

```bash
# Install Caddy (automatic HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy
sudo nano /etc/caddy/Caddyfile
```

Add to Caddyfile:
```
api.yourdomain.com {
    reverse_proxy localhost:8000
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy

# Check status
sudo systemctl status caddy
```

Now your API is available at `https://api.yourdomain.com` with automatic SSL!

---

## Deployment Script for Lightsail

Create `deploy-to-lightsail.sh`:

```bash
#!/bin/bash

# Upload code to Lightsail
rsync -avz --exclude 'node_modules' --exclude 'venv' --exclude '.git' \
  ./ ubuntu@YOUR_LIGHTSAIL_IP:~/mobimea/

# SSH and restart
ssh ubuntu@YOUR_LIGHTSAIL_IP << 'EOF'
cd ~/mobimea/backend

# If using Docker
docker stop mobimea-backend
docker rm mobimea-backend
docker build -t mobimea-backend .
docker run -d \
  --name mobimea-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  mobimea-backend

# If using PM2
# cd ~/mobimea/backend
# source venv/bin/activate
# pip install -r requirements.txt
# pm2 restart mobimea-backend

echo "✅ Backend deployed successfully!"
EOF
```

Make executable:
```bash
chmod +x deploy-to-lightsail.sh
```

Use it:
```bash
./deploy-to-lightsail.sh
```

---

## Monitoring

### View Logs

```bash
# Docker logs
ssh ubuntu@YOUR_LIGHTSAIL_IP
docker logs -f mobimea-backend

# PM2 logs
pm2 logs mobimea-backend
```

### Lightsail Metrics

In Lightsail Console → Instance → Metrics:
- CPU utilization
- Network in/out
- Status check failures

### Setup Alerts

In Lightsail Console → Instance → Metrics:
1. Click "Add alarm"
2. Metric: CPU utilization
3. Threshold: > 80% for 5 minutes
4. Email notification
5. Create

---

## Scaling

### Upgrade Instance

If you need more resources:

1. Lightsail Console → Instance → Stop instance
2. Manage → Change plan
3. Select bigger plan ($24 or $44/month)
4. Start instance

**Note**: Can only upgrade, not downgrade!

### Add Load Balancer (Optional)

For high traffic:

1. Lightsail Console → Networking → Load balancers
2. Create load balancer ($18/month)
3. Attach instances
4. Get load balancer DNS name

---

## Backup

### Manual Snapshot

```bash
# Lightsail Console → Instance → Snapshots → Create snapshot
# Cost: ~$0.05/GB per month
```

### Automatic Snapshots

```bash
# Lightsail Console → Instance → Snapshots tab
# Enable automatic snapshots
# Cost: ~$0.05/GB per month
```

### Database Backup

Supabase handles this automatically!

---

## Cost Breakdown

### Monthly Costs

| Item | Cost |
|------|------|
| Lightsail Instance ($12 plan) | $12.00 |
| S3 Storage (5 GB) | $0.12 |
| CloudFront (10 GB transfer) | $0.85 |
| **Total** | **$12.97/month** |

### Additional Costs (Optional)

- Load Balancer: +$18/month
- Static IP: Free (1 per instance)
- Snapshots: ~$0.05/GB
- Extra data transfer: $0.09/GB

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker logs mobimea-backend

# Or if using PM2
pm2 logs mobimea-backend

# Common issues:
# 1. Port 8000 not open in firewall
# 2. .env file missing
# 3. Dependencies not installed
```

### Can't connect to instance

```bash
# Check instance status in Lightsail console
# Check firewall rules
# Try restarting instance
```

### High CPU usage

```bash
# Check what's using CPU
ssh ubuntu@YOUR_LIGHTSAIL_IP
htop

# If playwright is using too much:
# 1. Reduce scraper frequency
# 2. Upgrade to $24 plan
# 3. Add more RAM
```

---

## Comparison: Lightsail vs ECS

| Feature | Lightsail | ECS Fargate |
|---------|-----------|-------------|
| **Cost** | $12-24/month | $30-50/month |
| **Setup Time** | 10 minutes | 30 minutes |
| **Complexity** | Simple | Complex |
| **Auto-scaling** | Manual | Automatic |
| **Best For** | Small-medium apps | Enterprise apps |
| **SSH Access** | ✅ Yes | ❌ No |
| **Fixed IP** | ✅ Free | ❌ Extra cost |
| **Predictable Cost** | ✅ Yes | ⚠️  Variable |

---

## Upgrade Path

Start with **Lightsail** → If you need more:

1. **Upgrade Plan**: $12 → $24 → $44/month
2. **Add Load Balancer**: For multiple instances
3. **Migrate to ECS**: For enterprise scale

---

## Quick Commands

```bash
# Deploy backend
./deploy-to-lightsail.sh

# View logs
ssh ubuntu@YOUR_IP docker logs -f mobimea-backend

# Restart backend
ssh ubuntu@YOUR_IP docker restart mobimea-backend

# Check status
ssh ubuntu@YOUR_IP docker ps

# Update code
./deploy-to-lightsail.sh
```

---

## Next Steps After Deployment

1. ✅ Test backend: `curl http://YOUR_IP:8000/api/health`
2. ✅ Deploy frontend with new backend URL
3. ✅ Setup SSL (Cloudflare or Caddy)
4. ✅ Setup monitoring and alerts
5. ✅ Create snapshot for backup
6. ✅ Test scrapers are working
7. ✅ Share your live URL!

---

🚀 **Lightsail Deployment Complete!**

**Total Time**: 10-15 minutes
**Monthly Cost**: ~$13
**Perfect for**: Getting started and moderate traffic

**Live App**: http://YOUR_LIGHTSAIL_IP:8000 (backend)
**Live App**: https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net (frontend)

---

**Need Enterprise Scale Later?**
Migrate to ECS using our `terraform/main.tf` configuration!
