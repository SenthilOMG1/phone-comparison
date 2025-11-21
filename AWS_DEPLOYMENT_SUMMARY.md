# AWS Deployment - Quick Start Guide

**MobiMEA Intelligence Platform** - Ready for AWS deployment! 🚀

---

## What's Been Created

### ✅ Deployment Files (9 files)

1. **backend/Dockerfile** - Backend container
2. **backend/.dockerignore** - Docker ignore rules
3. **.github/workflows/deploy-frontend.yml** - Frontend CI/CD
4. **.github/workflows/deploy-backend.yml** - Backend CI/CD
5. **terraform/main.tf** - Infrastructure as Code
6. **scripts/deploy-frontend.sh** - Frontend deployment script
7. **scripts/deploy-backend.sh** - Backend deployment script
8. **.env.example** - Environment variables template
9. **DEPLOYMENT.md** - Complete deployment guide (16 KB!)

---

## Architecture

```
User → CloudFront (CDN) → S3 (React App)
                ↓
           ECS Fargate (Python API)
                ↓
           Supabase (PostgreSQL)
```

**Estimated Cost**: ~$20-30/month

---

## 3 Ways to Deploy

### Option 1: Terraform (Automated) ⭐ RECOMMENDED

```bash
# 1. Configure AWS
aws configure

# 2. Deploy infrastructure
cd terraform
terraform init
terraform apply

# 3. Done!
```

**Time**: 10-15 minutes
**Pros**: Reproducible, easy to maintain

### Option 2: Manual AWS Console

```bash
# Follow DEPLOYMENT.md step-by-step
cat DEPLOYMENT.md
```

**Time**: 30-45 minutes
**Pros**: Learn AWS, full control

### Option 3: GitHub Actions (CI/CD)

```bash
# 1. Add GitHub Secrets:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - CLOUDFRONT_DISTRIBUTION_ID
# - VITE_API_URL

# 2. Push to main branch
git push origin main

# 3. Automatic deployment!
```

**Time**: 15 minutes setup
**Pros**: Auto-deploy on git push

---

## Quick Start (5 minutes)

### Step 1: Setup Environment

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env
```

**Required**:
- `DATABASE_URL` - Your Supabase connection string
- `GEMINI_API_KEY` - From Google AI Studio
- `VITE_API_URL` - Will be your backend URL

### Step 2: Deploy Backend

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret

# Deploy
cd terraform
terraform init
terraform apply
```

### Step 3: Deploy Frontend

```bash
# Get backend URL from terraform output
export VITE_API_URL=$(terraform output backend_url)

# Deploy
../scripts/deploy-frontend.sh
```

### Step 4: Done!

```bash
# Get your app URL
terraform output cloudfront_domain
```

Your app is now live! 🎉

---

## What Gets Deployed

### Frontend (S3 + CloudFront)
- ✅ React app built and optimized
- ✅ Uploaded to S3 bucket
- ✅ Served via CloudFront CDN
- ✅ HTTPS enabled
- ✅ Global edge caching
- **Cost**: ~$1-5/month

### Backend (ECS Fargate)
- ✅ Docker container built
- ✅ Pushed to ECR (container registry)
- ✅ Deployed to ECS Fargate
- ✅ Auto-scaling configured
- ✅ Health checks enabled
- **Cost**: ~$15-25/month

### Infrastructure
- ✅ VPC with subnets
- ✅ Security groups configured
- ✅ IAM roles created
- ✅ CloudWatch logging enabled
- ✅ Secrets Manager for sensitive data

---

## Environment Variables

### Where to Get Them

#### DATABASE_URL
1. Go to Supabase Dashboard
2. Project Settings → Database
3. Copy "Connection string" (URI)
4. Format: `postgresql://postgres:PASSWORD@db.project.supabase.co:5432/postgres`

#### GEMINI_API_KEY
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key (starts with `AIzaSy...`)

#### VITE_API_URL
- Development: `http://localhost:8000`
- Production: Your ECS task public URL (from terraform output)

---

## CI/CD Setup (GitHub Actions)

### 1. Add GitHub Secrets

Repository → Settings → Secrets and variables → Actions

Add these secrets:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
CLOUDFRONT_DISTRIBUTION_ID=E...
VITE_API_URL=https://your-backend-url
```

### 2. Workflows Already Created

- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-backend.yml`

### 3. Automatic Deployment

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Build frontend
2. Upload to S3
3. Invalidate CloudFront cache
4. Build Docker image
5. Push to ECR
6. Deploy to ECS

Watch progress: Repository → Actions

---

## Cost Breakdown

### Monthly Costs (1000 users/month)

| Service | Cost |
|---------|------|
| S3 Storage (5 GB) | $0.12 |
| CloudFront (10 GB transfer) | $0.85 |
| ECS Fargate (1 task) | $15.33 |
| ECR (1 GB) | $0.10 |
| CloudWatch Logs (5 GB) | $2.50 |
| **Total** | **~$19/month** |

### Cost Optimization Tips

1. Use Fargate Spot: Save 50-70%
2. Enable S3 Intelligent-Tiering
3. Set CloudWatch log retention to 7 days
4. Use CloudFront compression
5. Auto-scale ECS tasks (scale to 0 when idle)

---

## Monitoring

### View Logs

```bash
# Backend logs
aws logs tail /ecs/mobimea-backend --follow

# Recent errors
aws logs filter-log-events \
  --log-group-name /ecs/mobimea-backend \
  --filter-pattern "ERROR"
```

### Health Checks

```bash
# Backend health
curl https://your-backend-url/api/health

# Frontend
curl https://your-cloudfront-domain.cloudfront.net
```

### CloudWatch Dashboard

1. Go to CloudWatch → Dashboards
2. Create dashboard: "MobiMEA"
3. Add widgets:
   - ECS CPU utilization
   - ECS memory utilization
   - CloudFront requests
   - API response times

---

## Custom Domain (Optional)

### 1. Buy Domain

- AWS Route 53: $12/year
- or use existing domain

### 2. Create SSL Certificate

```bash
# Request certificate (must be in us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name mobimea.com \
  --subject-alternative-names www.mobimea.com \
  --validation-method DNS \
  --region us-east-1
```

### 3. Update CloudFront

1. CloudFront → Distribution → Edit
2. Alternate domain names: `mobimea.com`, `www.mobimea.com`
3. SSL certificate: Select ACM certificate
4. Save

### 4. Add DNS Records

1. Route 53 → Hosted zones → Your domain
2. Create A record (Alias) pointing to CloudFront

Done! Your app is now at `https://mobimea.com` 🎉

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
aws logs tail /ecs/mobimea-backend --follow

# Common issues:
# 1. Secrets not set in Secrets Manager
# 2. Security group doesn't allow port 8000
# 3. Task doesn't have public IP
```

### Frontend blank page

```bash
# Check browser console for errors

# Common issues:
# 1. VITE_API_URL not set correctly
# 2. Backend not accessible (CORS)
# 3. CloudFront cache not invalidated
```

### CORS errors

```bash
# Update backend/api/main.py
# Add your CloudFront domain to allow_origins

# Redeploy backend
./scripts/deploy-backend.sh
```

---

## Rollback

### Backend Rollback

```bash
# Update to previous task definition
aws ecs update-service \
  --cluster mobimea-cluster \
  --service mobimea-backend-service \
  --task-definition mobimea-backend:PREVIOUS_REVISION
```

### Frontend Rollback

```bash
# Re-deploy previous build
git checkout PREVIOUS_COMMIT
npm run build
aws s3 sync dist/ s3://mobimea-frontend-prod --delete
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Scaling

### Auto-scaling Backend

```bash
# Scale to 2 tasks
aws ecs update-service \
  --cluster mobimea-cluster \
  --service mobimea-backend-service \
  --desired-count 2

# Enable auto-scaling (via Terraform or Console)
# Min tasks: 1
# Max tasks: 5
# Target CPU: 70%
```

### Frontend Scaling

CloudFront automatically scales globally. No action needed! ✅

---

## Security Checklist

- [ ] Secrets in AWS Secrets Manager (not hardcoded)
- [ ] S3 bucket not public (CloudFront only)
- [ ] HTTPS enforced (CloudFront)
- [ ] IAM roles (no hardcoded credentials)
- [ ] Security groups restrict ports
- [ ] Database strong password
- [ ] Enable CloudTrail (audit logs)
- [ ] Enable GuardDuty (threat detection)

---

## Next Steps

After deployment:

1. **Test Everything**
   - Visit CloudFront URL
   - Test phone comparison
   - Check API health endpoint
   - Verify scrapers work

2. **Setup Monitoring**
   - CloudWatch alarms
   - Email notifications
   - Slack integration (optional)

3. **Setup Backup**
   - Database backups (Supabase does this)
   - S3 versioning
   - ECR image retention

4. **Performance**
   - Enable CloudFront compression
   - Add CloudFront functions (optional)
   - Optimize images

5. **Custom Domain**
   - Buy domain
   - Setup SSL
   - Update DNS

---

## Quick Commands

```bash
# Deploy everything
cd terraform && terraform apply

# Deploy frontend only
./scripts/deploy-frontend.sh

# Deploy backend only
./scripts/deploy-backend.sh

# View logs
aws logs tail /ecs/mobimea-backend --follow

# Scale backend
aws ecs update-service --cluster mobimea-cluster \
  --service mobimea-backend-service --desired-count 2

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

# Health check
curl https://your-backend-url/api/health
```

---

## Files Reference

- **DEPLOYMENT.md** - Complete guide (16 KB, read this!)
- **terraform/main.tf** - Infrastructure code
- **scripts/deploy-*.sh** - Deployment scripts
- **.github/workflows/** - CI/CD pipelines
- **.env.example** - Environment template

---

## Support

- AWS Issues: Check CloudWatch logs first
- Deployment Questions: See DEPLOYMENT.md
- Backend Issues: Check ECS task logs
- Frontend Issues: Check browser console

---

🚀 **Ready to Deploy!**

Choose your deployment method and follow the steps above.

**Estimated Total Time**: 15-30 minutes

**Result**: Production-ready app on AWS! 🎉
