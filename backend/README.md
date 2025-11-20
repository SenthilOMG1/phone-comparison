# MobiMEA Intelligence Platform - Backend

Backend system for scraping and analyzing mobile phone prices across Mauritius retailers.

## 🏗️ Architecture

```
backend/
├── scrapers/          # Website scrapers
│   ├── base_scraper.py       # Base class for all scrapers
│   ├── courts_scraper.py     # Courts Mammouth scraper
│   ├── galaxy_scraper.py     # Galaxy scraper (TODO)
│   └── priceguru_scraper.py  # Price Guru scraper (TODO)
├── database/          # Database management
│   ├── schema.sql            # PostgreSQL schema with TimescaleDB
│   ├── models.py             # SQLAlchemy models
│   └── db_manager.py         # Database operations
├── api/              # FastAPI REST API
│   ├── main.py               # API entry point (TODO)
│   ├── routes/               # API routes (TODO)
│   └── services/             # Business logic (TODO)
└── utils/            # Utilities
    └── gemini_normalizer.py  # Gemini-powered product normalization
```

## 📦 Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Install Playwright Browsers

```bash
playwright install chromium
```

### 3. Set Up PostgreSQL Database

Install PostgreSQL 15+ and TimescaleDB extension, then create database:

```bash
createdb mobimea_intelligence
psql mobimea_intelligence < database/schema.sql
```

### 4. Configure Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mobimea_intelligence
GEMINI_API_KEY=your_gemini_api_key_here
SCRAPER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
FRONTEND_URL=http://localhost:5177
PORT=8000
```

## 🧪 Testing

Test the scraper before running full system:

```bash
python test_scraper.py
```

This will:
1. Scrape Courts website for phones
2. Normalize product names with Gemini
3. Display results (doesn't save to database)

## 🚀 Running the API (TODO)

```bash
uvicorn api.main:app --reload --port 8000
```

## 📊 Database Schema

### Main Tables

**products** - Canonical product data
- Each unique phone model (e.g., "Samsung Galaxy S24 256GB Black")
- Generated slug for URLs
- Specs stored as JSONB

**retailers** - Retailer information
- Courts, Galaxy, Price Guru, 361
- Website and Facebook URLs
- Scraper configuration

**retailer_links** - Product-Retailer mapping
- Links products to specific retailer listings
- Stores original URL and scraped name

**prices** - TimescaleDB hypertable (time-series)
- Historical price data
- Cash/credit prices
- Stock status
- Promotion text

**promotions** - Active deals and promotions
- Sourced from websites and Facebook
- Discount amounts and percentages
- Start/end dates

### Views

**latest_prices** - Current prices across all retailers
**dashboard_stats** - Quick statistics for CEO dashboard

## 🤖 How Scrapers Work

1. **Navigate** to retailer website
2. **Extract** product listings (name, price, stock, URL)
3. **Filter** non-phone items
4. **Normalize** product names using Gemini API
5. **Save** to database with timestamp

## 🧠 Product Normalization

Uses Google Gemini to normalize product names:

```
Input:  "SAMSUNG GALAXY S24 ULTRA 512GB TITANIUM GRAY"
Output: {
  "brand": "Samsung",
  "model": "Galaxy S24 Ultra",
  "variant": "512GB Titanium Gray",
  "normalized_name": "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
  "slug": "samsung-galaxy-s24-ultra-512gb-titanium-gray"
}
```

This ensures same product from different retailers is matched correctly.

## 📝 Next Steps

- [ ] Build FastAPI endpoints
- [ ] Create remaining scrapers (Galaxy, Price Guru, 361)
- [ ] Implement Facebook monitoring
- [ ] Set up automated scheduling
- [ ] Deploy to production

## 🐛 Common Issues

**"Playwright browsers not installed"**
```bash
playwright install chromium
```

**"Database connection error"**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**"Gemini API error"**
- Check GEMINI_API_KEY in .env
- Verify API key is valid
- Check internet connection

## 📚 Tech Stack

- **Python 3.11+**
- **FastAPI** - REST API framework
- **Playwright** - Browser automation
- **PostgreSQL 15** - Database
- **TimescaleDB** - Time-series extension
- **SQLAlchemy** - ORM
- **Google Gemini 1.5 Flash** - AI normalization
