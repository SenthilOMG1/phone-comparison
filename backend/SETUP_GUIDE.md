# MobiMEA Intelligence Platform - Setup Guide

Complete step-by-step guide to get the backend running.

## 📋 Prerequisites

- **Python 3.11+** installed
- **PostgreSQL 15+** installed
- **Git** (optional)
- **Gemini API Key** (you already have: AIzaSyDvX4y6Blc567p_UdsXPqCUYEaKqAw0DQY)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Python Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

### Step 2: Set Up PostgreSQL Database

**Option A: Install PostgreSQL locally**

1. Download PostgreSQL 15: https://www.postgresql.org/download/
2. Install with default settings
3. Remember the password you set for `postgres` user

**Option B: Use cloud database (Railway, DigitalOcean, etc.)**

Skip local install, get DATABASE_URL from cloud provider.

**Create the database:**

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE mobimea_intelligence;

# Exit
\q

# Load schema
psql -U postgres -d mobimea_intelligence -f database/schema.sql
```

**Install TimescaleDB (optional but recommended):**

Follow: https://docs.timescale.com/install/latest/

```sql
-- In psql:
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### Step 3: Configure Environment

Your `.env` file is already created with:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mobimea_intelligence
GEMINI_API_KEY=AIzaSyDvX4y6Blc567p_UdsXPqCUYEaKqAw0DQY
```

**Update `DATABASE_URL` with your actual PostgreSQL password!**

### Step 4: Test the Scraper

```bash
# Test Courts scraper (no database required)
python test_scraper.py
```

Expected output:
```
TESTING COURTS SCRAPER
=====================
Status: success
Products found: 15-30
First 5 products:
1. Samsung Galaxy S24 Ultra...
```

### Step 5: Run Full Scrape & Save to Database

```bash
# Run all scrapers and save to database
python scrapers/scraper_orchestrator.py

# Or test mode (doesn't save):
python scrapers/scraper_orchestrator.py --test
```

### Step 6: Start the API Server

```bash
cd backend
python api/main.py
```

Or with uvicorn:
```bash
uvicorn api.main:app --reload --port 8000
```

API will be available at: **http://localhost:8000**

Test it: http://localhost:8000/docs (auto-generated API docs)

---

## 🔄 Running the Scheduler

To automatically scrape every 6 hours:

```bash
# Start scheduler (runs in background)
python utils/scheduler.py

# Run once immediately then start scheduler
python utils/scheduler.py --now

# Run once and exit (no scheduling)
python utils/scheduler.py --once
```

---

## 📊 API Endpoints

Once API is running, test these endpoints:

### Dashboard
- `GET /api/dashboard/stats` - Overall statistics
- `GET /api/dashboard/latest-prices` - Latest prices

### Products
- `GET /api/products/{slug}` - Product details
- `GET /api/products/{slug}/best-price` - Best current price
- `GET /api/products/{slug}/price-history?days=30` - Price history

### Promotions
- `GET /api/promotions/active` - Active promotions
- `GET /api/promotions/active?brand=Honor` - Filter by brand

### Market Intelligence
- `GET /api/market/brand-comparison` - Compare brands
- `GET /api/market/retailer-comparison` - Compare retailers

### Scraper Status
- `GET /api/scrapers/logs` - Recent scraper runs

---

## 🧪 Testing Workflow

### 1. Test Scraper (No Database)
```bash
python test_scraper.py
```

### 2. Test Database Connection
```bash
python -c "from database.db_manager import DatabaseManager; db = DatabaseManager(); print('DB connected!'); print(db.get_dashboard_stats())"
```

### 3. Run Scraper & Save
```bash
python scrapers/scraper_orchestrator.py --retailer "Courts Mauritius"
```

### 4. Check API
```bash
curl http://localhost:8000/api/dashboard/stats
```

---

## 🐛 Troubleshooting

### "ModuleNotFoundError"
```bash
# Make sure you're in virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall packages
pip install -r requirements.txt
```

### "Playwright browsers not found"
```bash
playwright install chromium
```

### "Database connection error"
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Test connection: `psql -U postgres -d mobimea_intelligence`

### "Gemini API error"
- Check GEMINI_API_KEY in `.env`
- Test key: https://aistudio.google.com/

### "No products found" when scraping
- Website structure may have changed
- Check scraper logs for errors
- Try with `--test` flag to see detailed output

---

## 📁 Project Structure

```
backend/
├── api/
│   └── main.py           # FastAPI server (16 endpoints)
├── database/
│   ├── schema.sql        # PostgreSQL schema
│   ├── models.py         # SQLAlchemy models
│   └── db_manager.py     # Database operations
├── scrapers/
│   ├── base_scraper.py   # Base scraper class
│   ├── courts_scraper.py # Courts implementation
│   └── scraper_orchestrator.py  # Run all scrapers
├── utils/
│   ├── gemini_normalizer.py  # Gemini product normalization
│   └── scheduler.py          # Automated scheduling
├── test_scraper.py      # Test scrapers
├── requirements.txt     # Python dependencies
└── .env                 # Configuration
```

---

## 🎯 Next Steps

1. **Test the current setup** - Make sure Courts scraper works
2. **Build more scrapers** - Galaxy, Price Guru, 361
3. **Connect frontend** - Integrate React app with API
4. **Deploy** - Move to production server

---

## 💡 Quick Commands Reference

```bash
# Setup
pip install -r requirements.txt
playwright install chromium

# Test
python test_scraper.py

# Scrape
python scrapers/scraper_orchestrator.py
python scrapers/scraper_orchestrator.py --retailer "Courts Mauritius"

# API
python api/main.py
# or
uvicorn api.main:app --reload --port 8000

# Scheduler
python utils/scheduler.py --now

# Database
psql -U postgres -d mobimea_intelligence
```

---

## 🆘 Need Help?

Check:
1. Backend logs for errors
2. PostgreSQL logs: `pg_ctl status`
3. API docs: http://localhost:8000/docs
4. Database: `psql -U postgres -d mobimea_intelligence -c "SELECT * FROM dashboard_stats;"`
