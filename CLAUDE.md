# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MobiMEA Intelligence Platform** - A dual-purpose system for MobiMEA (Honor phone importer in Mauritius):

1. **Frontend**: Interactive 6-phone comparison tool with AI-powered insights (React + TypeScript)
2. **Backend**: Business intelligence system with automated price scraping from Mauritius retailers (Python + FastAPI)

**Business Purpose:**
- **Sales Tool**: Help staff compare Honor phones vs competitors with persona-based recommendations
- **Market Intelligence**: Track competitor pricing across all Mauritius retailers (Courts, Galaxy, Price Guru, 361)
- **CEO Dashboard**: Live market insights and pricing strategy data (in development)
- Empowers decision-making with evidence-based data curated for Mauritius market

**Current Status**: ~70% complete. Frontend fully functional with Clean Architecture. Backend deployed on AWS Lightsail with Gemini AI-powered scrapers. Supabase database configured. Frontend-backend integration in progress.

## Development Commands

### Frontend
```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (http://localhost:5177)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
npm run typecheck  # Type check without emitting
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

# Test traditional scraper (no database)
python test_scraper.py

# Test Gemini AI vision scraper (Courts - with screenshots)
python scrapers/gemini_agent_scraper.py

# Test deep scraper (clicks into each product for full specs)
python scrapers/deep_gemini_scraper.py

# Run all scrapers and save to database
python scrapers/scraper_orchestrator.py

# Run single retailer
python scrapers/scraper_orchestrator.py --retailer "Courts Mauritius"

# Start API server
python api/main.py        # http://localhost:8000
# Or: uvicorn api.main:app --reload --port 8000

# Start automated scheduler (every 6 hours)
python utils/scheduler.py

# One-time scrape
python utils/scheduler.py --once
```

### Database Setup (Supabase)
```bash
# Configure backend/.env:
SUPABASE_URL=https://vdyhrjlqqfrsvqnilkuc.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
DATABASE_URL=postgresql://postgres:Mobi%402025@db.vdyhrjlqqfrsvqnilkuc.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSyC6-S6Jrgby1sIsqvTMnTc4cWnI5PSCre4
FRONTEND_URL=http://localhost:5177
PORT=8000
```

### Deployment (AWS Lightsail)
```bash
# Server: 13.214.194.115 (Singapore region)
# Access: ssh -i intel.mobimea.pem ubuntu@13.214.194.115

# Frontend: http://13.214.194.115 (Nginx)
# Backend API: http://13.214.194.115/api/health
# SSL (pending DNS): https://intel.mobimea.com

# Backend runs in Docker container
# Frontend built with: VITE_API_URL=/api npm run build
# Caddy configured for automatic HTTPS when DNS propagates
```

## Architecture

### Tech Stack

**Frontend**:
- React 18.3 + TypeScript 5.9 + Vite 5.4
- Tailwind CSS 3.4 + Framer Motion 12.23
- React Router 7.9 + Fuse.js 7.1
- Google Gemini 1.5 Flash (chatbot)

**Backend**:
- Python 3.11 + FastAPI 0.104 + Uvicorn 0.24
- Supabase (PostgreSQL + TimescaleDB for time-series data)
- SQLAlchemy 2.0 + Playwright 1.40
- Google Gemini 2.5 Flash (AI vision scraping + product normalization)
- APScheduler 3.10 (automation)
- Docker deployment on AWS Lightsail

### Frontend: Clean Architecture

The frontend implements Clean Architecture (Domain-Driven Design) with clear layer separation:

**Domain Layer** (`src/domain/`):
- **Entities**: `Phone.entity.ts`, `Comparison.entity.ts` - Rich domain models with business logic
- **Value Objects**: `Price.ts`, `Score.ts`, `Benchmark.ts` - Immutable types with validation
- **Repositories**: `IPhoneRepository.ts` - Interfaces defining data access contracts
- **Use Cases**: `ComparePhones.usecase.ts`, `SearchPhones.usecase.ts` - Pure business logic

**Application Layer** (`src/application/`):
- **Services**: `PhoneService.ts` - Orchestrates use cases, facade for presentation layer
- **Mappers**: `PhoneMapper.ts`, `ComparisonMapper.ts` - Convert between DTOs and entities

**Infrastructure Layer** (`src/infrastructure/`):
- **Repositories**: `StaticPhoneRepository.ts` - Concrete implementations (static data or API)

**Dependency Injection** (`src/di/container.ts`):
- Service locator pattern managing dependencies
- Easy to swap implementations (e.g., static data → API)

**Benefits**:
- Testable: Pure business logic independent of frameworks
- Maintainable: Clear separation of concerns
- Flexible: Easy to replace data sources
- Type-safe: Full TypeScript coverage

### Frontend: Core Services Layer

**Scoring Engine** (`src/services/scoring/scoring.engine.ts`)
- Calculates category-specific scores (camera, performance, battery, display, value)
- Uses persona-weighted scoring system that dynamically adjusts based on user priorities
- Normalizes metrics against predefined ranges in `scoring.config.ts`
- Camera scores use DXOMARK-style ratings when available, falls back to spec-based calculation
- Performance scores derived from Geekbench (single/multi-core) and AnTuTu benchmarks
- Value score calculates price-to-performance ratio

**Search Service** (`src/services/search/search.service.ts`)
- Multi-layered fuzzy search using Fuse.js + custom token matching
- Combines three scoring approaches: string similarity (30%), token set ratio (40%), Fuse score (30%)
- Normalizes query strings and expands common shorthand (e.g., "pro" -> "pro", "s24" -> "s24")
- Returns results with confidence scores and match types (exact/fuzzy/partial)

**Comparison Service** (`src/services/comparison/comparison.service.ts`)
- Orchestrates phone comparisons and generates insights
- Creates TLDR summaries with overall winner determination
- Generates persona-specific recommendations by recalculating scores with different weights
- Produces category scores with rationale explanations

**Difference Engine** (`src/services/comparison/difference.engine.ts`)
- Extracts 4-6 most significant spec differences between phones
- Calculates deltas with significance levels (major/notable/minor/none)
- Generates "why it matters" explanations for each difference
- Prioritizes differences by significance and returns top 6

### Persona System

Personas represent customer segments in the Mauritius market. Sales staff can select the persona matching their customer to get tailored recommendations:
- **Photographer**: Camera (45%), Performance (15%), Battery (15%), Display (15%), Value (10%)
- **Gamer**: Performance (45%), Display (20%), Battery (15%), Camera (10%), Value (10%)
- **Battery User**: Battery (50%), Performance (15%), Value (15%), Camera (10%), Display (10%)
- **Budget Buyer**: Value (25%), Camera (20%), Performance (20%), Battery (20%), Display (15%)

When persona changes, all scores recalculate in real-time to reflect new priorities, helping sales staff pitch the right Honor device for each customer type.

### Data Structure

**Phone Type** (`src/types/phone.types.ts`)
- Main entity with specs, benchmarks, pricing, and reviews
- Supports regional variants (global/china/india/europe/us)
- Images include hero + optional gallery
- Provenance tracking for spec verification

**Specs Type** (`src/types/specs.types.ts`)
- Nested structure: display, processor, camera, battery, connectivity
- Camera includes multiple lenses (main/ultrawide/telephoto/macro)
- Optional cameraScore with subcategories (photo/zoom/video/overall)

**Benchmark Data** (`src/types/benchmark.types.ts`)
- Stores min/max/median values for Geekbench and AnTuTu
- Includes provenance (source URL, verification date)

### Scoring Configuration

`src/config/scoring.config.ts` defines:
- Category weights within each scoring function
- Normalization ranges for fair comparison (e.g., geekbenchSingle: 500-2500)
- Significance thresholds: major (25%+), notable (10%+), minor (5%+)

### Component Architecture

**Pages**: Home and Compare routes
- Home: Search interface + phone selection workflow
- Compare: Side-by-side comparison with TLDR, category scores, and difference highlights

**UI Components** (`src/components/ui/`)
- Card, Button, Badge with consistent Tailwind styling
- Design tokens in `config/design.tokens.ts`

**Feature Components**:
- `PhoneCard`: Displays phone details with specs and badges
- `DifferenceHighlights`: Shows top 4-6 differences with significance badges
- `TLDRCard`: Quick verdict summary
- `PersonaSelector`: Persona switcher with real-time score recalculation

### Custom Hooks

- `usePersona`: Manages active persona with localStorage persistence
- `useSearch`: Wraps search service with debouncing
- `useDebounce`: General purpose debounce hook
- `useLocalStorage`: Type-safe localStorage wrapper

### Backend: Scraping & Intelligence Pipeline

**Scraping Architecture** (`backend/scrapers/`):

**Three types of scrapers:**

1. **Traditional Scrapers** (Playwright + CSS selectors):
   - `CourtsScraper`, `GalaxyScraper` - Hardcoded selectors
   - Fast but brittle (breaks when site changes)

2. **Gemini Vision Agent** (`gemini_agent_scraper.py`):
   - Takes screenshots of pages
   - Gemini 2.5 Flash analyzes what it sees
   - Intelligently scrolls, clicks, extracts
   - No hardcoded selectors - adapts to site changes
   - Slower but much more robust

3. **Deep Gemini Scraper** (`deep_gemini_scraper.py`):
   - Finds all product links on listing page
   - Clicks into EACH product detail page
   - Extracts COMPLETE specs for comparison app:
     * Display, processor, RAM, storage, camera
     * Battery, connectivity, software, physical specs
     * Pricing (cash, credit, discounts)
     * Images, stock status
   - Perfect for populating comparison app database

**Flow**:
```
ScraperOrchestrator.run_all_scrapers()
    ├─ Run scrapers in parallel (asyncio.gather)
    │  ├─ DeepGeminiScraper (AI-powered, gets full specs)
    │  ├─ CourtsScraper (traditional, fast)
    │  └─ GalaxyScraper (traditional, fast)
    ├─ ProductNormalizer.normalize() [Regex or Gemini API]
    ├─ DatabaseManager.save_scrape_result() → Supabase
    └─ ScraperScheduler (6 AM, 12 PM, 6 PM, 12 AM)
```

**BaseScraper** (`backend/scrapers/base_scraper.py`):
- Abstract base class for all retailer scrapers
- Playwright browser automation with anti-detection (random UA, headers)
- Returns: `{status, products_found, products, errors, execution_time_ms}`
- Helper methods: `extract_price()`, `is_phone_product()`, `clean_text()`

**ProductNormalizer** (`backend/utils/gemini_normalizer.py`):
- **Fast path** (70%): Regex for common phones (iPhone, Galaxy, Xiaomi, Honor)
- **Slow path** (30%): Gemini API for complex/unknown names
- **LRU cache**: 1000 entries prevents re-normalization
- Output: `{brand, model, variant, normalized_name, slug}`
- Example: "SAMSUNG S24 ULTRA 512GB" → `{brand: "Samsung", model: "Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra-512gb"}`

**Database Schema** (`backend/database/schema.sql`):
- **products**: Canonical phone data with unique slug
- **retailer_links**: Product-Retailer mapping (many-to-many)
- **prices**: TimescaleDB hypertable for historical price tracking
- **promotions**: Active deals with discount details
- **scraper_logs**: Execution monitoring

**Views**:
- `latest_prices`: Current prices across all retailers (DISTINCT ON)
- `dashboard_stats`: Summary statistics for CEO dashboard

**REST API** (`backend/api/main.py`) - 16 Endpoints:
- **Dashboard**: `GET /api/dashboard/stats`, `/api/dashboard/latest-prices`
- **Products**: `GET /api/products/{slug}`, `/api/products/{slug}/best-price`, `/api/products/{slug}/price-history?days=30`
- **Promotions**: `GET /api/promotions/active?brand=Honor&retailer=Courts`
- **Market Intelligence**: `GET /api/market/brand-comparison`, `/api/market/retailer-comparison`
- **Monitoring**: `GET /api/scrapers/logs`

**Data Flow**:
1. Scraper extracts products from retailer website
2. ProductNormalizer matches to canonical name
3. DatabaseManager upserts products, links, and price records
4. TimescaleDB partitions price data by time for efficient historical queries
5. API endpoints serve latest prices + analytics
6. (TODO) Frontend calls API instead of static data

## Key Technical Decisions

1. **Clean Architecture**: Frontend uses Domain-Driven Design with entities, value objects, use cases, and dependency injection. Makes testing and maintenance easier.
2. **AI-Powered Scraping**: Gemini 2.5 Flash with vision capability "sees" webpages and extracts data intelligently. No brittle CSS selectors. Deep scraper clicks into each product for complete specs.
3. **Supabase Database**: Managed PostgreSQL with TimescaleDB for price history. Handles auth, real-time subscriptions, and time-series data.
4. **Mauritius Market Configuration**: All prices in MUR (Mauritian Rupee) with `en-MU` locale. Retailers: Courts, Galaxy, Price Guru, 361 Degrees.
5. **Gemini for Normalization**: Handles product name variations across retailers (e.g., "SAMSUNG S24 ULTRA 512GB" vs "Galaxy S24 Ultra 512 GB Black" → same product).
6. **Playwright over Scrapy**: Handles JavaScript-heavy websites. Async browser automation with anti-detection. Works with Gemini vision for intelligent extraction.
7. **Persona-Based Scoring**: Different customer segments (Photographer, Gamer, Battery User, Budget Buyer) get tailored recommendations with dynamic score recalculation.
8. **AWS Lightsail Deployment**: Single $12/month instance running both frontend (Nginx) and backend (Docker). Caddy for automatic HTTPS. Simple and cost-effective.
9. **No Global State Management**: React local state + URL params + localStorage is sufficient. No Redux/Zustand needed.
10. **APScheduler over Cron**: Cross-platform Python-native scheduling. Runs scrapers every 6 hours.

## Adding New Phones

**Honor Phones**: Add to `src/data/phones/honor.data.ts`
**Competitor Phones**: Add to `src/data/phones/samsung.data.ts` or create new brand files (e.g., `xiaomi.data.ts`, `oneplus.data.ts`)

Required fields for each phone:
- Complete specs with provenance (source verification)
- Benchmark data from Geekbench/AnTuTu (use median values from multiple test runs)
- Optional cameraScore if DXOMARK or similar professional test data available
- Pricing array with **Mauritius pricing in MUR** (Mauritian Rupee) - critical for accurate value calculations
- Hero image URL (preferably from Honor's official assets for Honor devices)

## Styling System

Custom Tailwind color palette defined in `tailwind.config.js`:
- Primary (blue): Used for main actions and highlights
- Secondary (orange): Accent color
- Success (green): Positive indicators, winning scores
- Warning (yellow): Notable differences
- Error (red): Critical differences

All colors have 50-900 scale for consistent theming.

## Type Safety

TypeScript is enforced throughout. Key type locations:
- `src/types/phone.types.ts`: Phone, PhoneSearchResult, PhoneVariant
- `src/types/persona.types.ts`: PersonaType, PersonaConfig
- `src/types/comparison.types.ts`: Comparison, ComparisonInsights, DifferenceHighlight
- `src/types/specs.types.ts`: PhoneSpecs and all spec-related interfaces
- `src/types/benchmark.types.ts`: BenchmarkData, BenchmarkScore

## State Management

No Redux or Zustand. State is:
- Component-local (useState) for UI state
- URL params for comparison state (`/compare?phone1=X&phone2=Y`)
- localStorage for persona preference (via usePersona hook)

## Adding New Scrapers (Backend)

Create a new scraper by extending `BaseScraper`:

```python
# backend/scrapers/priceguru_scraper.py
from .base_scraper import BaseScraper
from playwright.async_api import Page
from typing import List, Dict

class PriceGuruScraper(BaseScraper):
    def __init__(self):
        super().__init__('Price Guru', 'https://priceguru.mu')

    async def extract_products(self, page: Page) -> List[Dict]:
        await page.goto(f"{self.base_url}/smartphones")
        await self.wait_for_content(page)

        # Find product selector (inspect website)
        products = []
        elements = await page.query_selector_all('.product-item')

        for elem in elements:
            name = await elem.query_selector('.name')
            price = await elem.query_selector('.price')
            # Extract data...
            products.append({
                'name': name_text,
                'price_cash': price_value,
                'in_stock': True,
                'url': product_url
            })

        return products
```

Then add to `backend/scrapers/scraper_orchestrator.py`:
```python
from scrapers.priceguru_scraper import PriceGuruScraper

self.scrapers = [
    CourtsScraper(),
    GalaxyScraper(),
    PriceGuruScraper(),  # Add here
]
```

## Frontend-Backend Integration (TODO)

To connect frontend to backend API:

1. **Create API service** (`src/services/api.ts`):
```typescript
const API_URL = 'http://localhost:8000';

export async function getLatestPrices() {
  const response = await fetch(`${API_URL}/api/dashboard/latest-prices`);
  return response.json();
}

export async function getProductBySlug(slug: string) {
  const response = await fetch(`${API_URL}/api/products/${slug}`);
  return response.json();
}

export async function getPriceHistory(slug: string, days: number = 30) {
  const response = await fetch(`${API_URL}/api/products/${slug}/price-history?days=${days}`);
  return response.json();
}
```

2. **Update search service** to fetch from API instead of static data:
```typescript
// src/services/search/search.service.ts
import { getLatestPrices } from '../api';

export async function searchPhones(query: string) {
  const apiData = await getLatestPrices();
  // Merge with static data or replace entirely
  // Continue with existing Fuse.js logic
}
```

3. **Add loading states** in components:
```typescript
const [isLoading, setIsLoading] = useState(true);
const [prices, setPrices] = useState([]);

useEffect(() => {
  getLatestPrices()
    .then(data => setPrices(data.prices))
    .finally(() => setIsLoading(false));
}, []);
```

## Production Deployment (AWS Lightsail)

**Current Setup:**
- Server: Ubuntu 22.04 on AWS Lightsail ($12/month)
- IP: 13.214.194.115 (Singapore region)
- Domain: intel.mobimea.com (DNS pending)

**Backend:**
- Dockerized FastAPI app running on port 8000
- Connected to Supabase PostgreSQL
- Auto-restart enabled (`docker run --restart unless-stopped`)

**Frontend:**
- Built with `VITE_API_URL=/api npm run build`
- Served by Nginx from `/home/ubuntu/mobimea/dist`
- Nginx proxies `/api/*` requests to backend container

**HTTPS:**
- Caddy configured for automatic SSL (waiting for DNS)
- Will auto-obtain Let's Encrypt cert when intel.mobimea.com DNS propagates

**Deployment Commands:**
```bash
# SSH into server
ssh -i intel.mobimea.pem ubuntu@13.214.194.115

# Update backend
cd ~/mobimea/backend
git pull
docker build -t mobimea-backend .
docker stop mobimea-backend && docker rm mobimea-backend
docker run -d --name mobimea-backend --restart unless-stopped -p 8000:8000 --env-file .env mobimea-backend

# Update frontend
cd ~/mobimea
git pull
VITE_API_URL=/api npm run build
sudo systemctl reload caddy  # Or nginx if using that
```

## Documentation Files

- **`PROJECT_SUMMARY.md`**: Comprehensive project overview and current progress
- **`backend/README.md`**: Backend technical documentation
- **`backend/SETUP_GUIDE.md`**: Step-by-step backend setup instructions
- **`CLAUDE.md`**: This file - architecture and development guide
