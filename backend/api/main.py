from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Import our modules
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_manager_supabase import DatabaseManager

load_dotenv()

app = FastAPI(
    title="MobiMEA Intelligence Platform API",
    description="Live phone price tracking and market intelligence for Mauritius",
    version="1.0.0"
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        os.getenv("FRONTEND_URL", "http://localhost:5177")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database manager
db_manager = DatabaseManager()

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "MobiMEA Intelligence Platform API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    try:
        stats = db_manager.get_dashboard_stats()
        return {
            "status": "healthy",
            "database": "connected",
            "last_scrape": stats.get('last_scrape_time'),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

# ========================================
# DASHBOARD ENDPOINTS
# ========================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get overall statistics for CEO dashboard"""
    try:
        stats = db_manager.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/latest-prices")
async def get_latest_prices(limit: int = 50):
    """Get latest prices across all products and retailers"""
    try:
        prices = db_manager.get_latest_prices(limit=limit)
        return {
            "count": len(prices),
            "prices": prices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# PRODUCT ENDPOINTS
# ========================================

@app.get("/api/products/{slug}")
async def get_product_details(slug: str):
    """Get detailed product information with all retailer prices"""
    try:
        product = db_manager.get_product_by_slug(slug)

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/{slug}/best-price")
async def get_best_price(slug: str):
    """Get the best current price for a product"""
    try:
        product = db_manager.get_product_by_slug(slug)

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Find best price (lowest price that's in stock)
        in_stock_prices = [p for p in product['prices'] if p['in_stock'] and p['price']]

        if not in_stock_prices:
            # No in-stock prices, show all prices
            all_prices = [p for p in product['prices'] if p['price']]
            best_price = min(all_prices, key=lambda x: x['price']) if all_prices else None
        else:
            best_price = min(in_stock_prices, key=lambda x: x['price'])

        return {
            "product": {
                "name": product['name'],
                "brand": product['brand'],
                "model": product['model'],
                "variant": product['variant'],
                "slug": product['slug']
            },
            "best_price": best_price,
            "all_prices": product['prices']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# PRICE HISTORY ENDPOINTS
# ========================================

@app.get("/api/products/{slug}/price-history")
async def get_price_history(slug: str, days: int = 30, retailer: Optional[str] = None):
    """Get price history for a product"""
    try:
        # TODO: Implement with Supabase - returning empty for now
        return {
            'product_slug': slug,
            'days': days,
            'retailer_filter': retailer,
            'history': [],
            'statistics': None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# PROMOTIONS ENDPOINTS
# ========================================

@app.get("/api/promotions/active")
async def get_active_promotions(brand: Optional[str] = None, retailer: Optional[str] = None):
    """Get all active promotions"""
    try:
        # TODO: Implement with Supabase - returning empty for now
        return {
            'count': 0,
            'promotions': []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# MARKET INTELLIGENCE ENDPOINTS
# ========================================

@app.get("/api/market/brand-comparison")
async def get_brand_comparison():
    """Compare average prices across brands"""
    try:
        result = db_manager.get_brand_comparison()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/retailer-comparison")
async def get_retailer_comparison():
    """Compare retailers by product count and pricing"""
    try:
        # TODO: Implement with Supabase - returning empty for now
        return {
            'retailers': []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# SCRAPER STATUS ENDPOINTS
# ========================================

@app.get("/api/scrapers/logs")
async def get_scraper_logs(limit: int = 50):
    """Get recent scraper execution logs"""
    try:
        result = db_manager.get_scraper_logs(limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
