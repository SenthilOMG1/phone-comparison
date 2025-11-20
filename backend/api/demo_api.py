"""
Demo API Server - Works without database
Provides mock data for testing frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI(title="MobiMEA Intelligence API (Demo Mode)")

# CORS middleware - Allow all localhost ports for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in dev mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_BRANDS = [
    {"brand": "Honor", "product_count": 8, "avg_price": 28500, "min_price": 12000, "max_price": 42000, "in_stock_count": 8},
    {"brand": "Samsung", "product_count": 15, "avg_price": 45000, "min_price": 18000, "max_price": 75000, "in_stock_count": 13},
    {"brand": "Xiaomi", "product_count": 12, "avg_price": 32000, "min_price": 15000, "max_price": 55000, "in_stock_count": 11},
    {"brand": "Apple", "product_count": 6, "avg_price": 85000, "min_price": 65000, "max_price": 120000, "in_stock_count": 5},
    {"brand": "OnePlus", "product_count": 5, "avg_price": 38000, "min_price": 25000, "max_price": 52000, "in_stock_count": 5},
]

MOCK_RETAILERS = [
    {"retailer": "Courts Mauritius", "product_count": 35, "avg_price": 42000, "min_price": 12000, "max_price": 120000, "in_stock_count": 32},
    {"retailer": "Galaxy", "product_count": 28, "avg_price": 43500, "min_price": 15000, "max_price": 115000, "in_stock_count": 25},
    {"retailer": "Price Guru", "product_count": 32, "avg_price": 40500, "min_price": 12000, "max_price": 118000, "in_stock_count": 30},
    {"retailer": "361 Degrees", "product_count": 25, "avg_price": 44000, "min_price": 18000, "max_price": 110000, "in_stock_count": 22},
]

MOCK_PRODUCTS = [
    {"product_name": "Honor Magic 6 Pro", "brand": "Honor", "slug": "honor-magic-6-pro", "retailer": "Courts Mauritius", "price": 42000, "original_price": 45000, "in_stock": True, "url": "https://courtsmammouth.mu", "last_updated": datetime.now().isoformat()},
    {"product_name": "Honor Magic 6", "brand": "Honor", "slug": "honor-magic-6", "retailer": "Galaxy", "price": 35000, "original_price": 38000, "in_stock": True, "url": "https://galaxy.mu", "last_updated": datetime.now().isoformat()},
    {"product_name": "Samsung Galaxy S24 Ultra", "brand": "Samsung", "slug": "samsung-galaxy-s24-ultra", "retailer": "Courts Mauritius", "price": 65000, "original_price": 70000, "in_stock": True, "url": "https://courtsmammouth.mu", "last_updated": datetime.now().isoformat()},
    {"product_name": "Samsung Galaxy S24", "brand": "Samsung", "slug": "samsung-galaxy-s24", "retailer": "Price Guru", "price": 48000, "original_price": 52000, "in_stock": True, "url": "https://priceguru.mu", "last_updated": datetime.now().isoformat()},
    {"product_name": "Xiaomi 14 Pro", "brand": "Xiaomi", "slug": "xiaomi-14-pro", "retailer": "Galaxy", "price": 52000, "original_price": None, "in_stock": True, "url": "https://galaxy.mu", "last_updated": datetime.now().isoformat()},
    {"product_name": "iPhone 15 Pro Max", "brand": "Apple", "slug": "iphone-15-pro-max", "retailer": "Courts Mauritius", "price": 110000, "original_price": None, "in_stock": True, "url": "https://courtsmammouth.mu", "last_updated": datetime.now().isoformat()},
]

MOCK_PROMOTIONS = [
    {
        "id": 1,
        "product_name": "Honor Magic 6 Pro",
        "brand": "Honor",
        "slug": "honor-magic-6-pro",
        "retailer": "Courts Mauritius",
        "title": "Black Friday Special - Honor Magic 6 Pro",
        "description": "Get the flagship Honor Magic 6 Pro with FREE wireless earbuds",
        "discount_percentage": 10,
        "original_price": 45000,
        "discounted_price": 42000,
        "valid_from": (datetime.now() - timedelta(days=5)).isoformat(),
        "valid_until": (datetime.now() + timedelta(days=10)).isoformat(),
        "source_url": "https://courtsmammouth.mu/promo",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": 2,
        "product_name": "Samsung Galaxy S24",
        "brand": "Samsung",
        "slug": "samsung-galaxy-s24",
        "retailer": "Price Guru",
        "title": "Samsung S24 Price Drop!",
        "description": "Limited time offer on Samsung Galaxy S24",
        "discount_percentage": 8,
        "original_price": 52000,
        "discounted_price": 48000,
        "valid_from": (datetime.now() - timedelta(days=3)).isoformat(),
        "valid_until": (datetime.now() + timedelta(days=7)).isoformat(),
        "source_url": "https://priceguru.mu/samsung",
        "created_at": datetime.now().isoformat()
    },
]

# Generate mock price history
def generate_price_history(base_price, days=30):
    history = []
    retailers = ["Courts Mauritius", "Galaxy", "Price Guru"]

    for i in range(days):
        date = datetime.now() - timedelta(days=days-i)
        for retailer in retailers:
            # Add some price variation
            variation = random.randint(-2000, 2000)
            price = base_price + variation

            history.append({
                "timestamp": date.isoformat(),
                "price": price,
                "retailer": retailer
            })

    return history

@app.get("/")
def read_root():
    return {
        "message": "MobiMEA Intelligence API (Demo Mode)",
        "version": "1.0.0",
        "mode": "demo",
        "note": "Using mock data - no database required"
    }

# Dashboard endpoints
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return {
        "total_products": 46,
        "active_retailers": 4,
        "products_in_stock": 42,
        "active_promotions": len(MOCK_PROMOTIONS),
        "last_scrape_time": datetime.now().isoformat()
    }

@app.get("/api/dashboard/latest-prices")
def get_latest_prices(brand: str = None, retailer: str = None, in_stock_only: bool = False):
    prices = MOCK_PRODUCTS.copy()

    if brand:
        prices = [p for p in prices if p["brand"].lower() == brand.lower()]
    if retailer:
        prices = [p for p in prices if p["retailer"].lower() == retailer.lower()]
    if in_stock_only:
        prices = [p for p in prices if p["in_stock"]]

    return {
        "prices": prices,
        "total_count": len(prices)
    }

# Product endpoints
@app.get("/api/products/{slug}")
def get_product(slug: str):
    product = next((p for p in MOCK_PRODUCTS if p["slug"] == slug), None)
    if product:
        return {
            "id": 1,
            "brand": product["brand"],
            "model": product["product_name"],
            "variant": None,
            "normalized_name": product["product_name"],
            "slug": slug,
            "created_at": datetime.now().isoformat()
        }
    return {"error": "Product not found"}

@app.get("/api/products/{slug}/best-price")
def get_best_price(slug: str):
    matching_products = [p for p in MOCK_PRODUCTS if p["slug"] == slug]

    if not matching_products:
        return {"error": "Product not found"}

    best = min(matching_products, key=lambda x: x["price"])

    return {
        "product": {
            "name": best["product_name"],
            "brand": best["brand"],
            "slug": slug
        },
        "best_price": {
            "retailer": best["retailer"],
            "price": best["price"],
            "original_price": best.get("original_price"),
            "in_stock": best["in_stock"],
            "url": best["url"],
            "last_updated": best["last_updated"]
        },
        "all_prices": matching_products
    }

@app.get("/api/products/{slug}/price-history")
def get_price_history(slug: str, days: int = 30):
    product = next((p for p in MOCK_PRODUCTS if p["slug"] == slug), None)

    if not product:
        return {"error": "Product not found"}

    history = generate_price_history(product["price"], days)

    return {
        "product": {
            "normalized_name": product["product_name"],
            "brand": product["brand"],
            "slug": slug
        },
        "history": history,
        "days": days
    }

# Promotions endpoints
@app.get("/api/promotions/active")
def get_active_promotions(brand: str = None, retailer: str = None):
    promos = MOCK_PROMOTIONS.copy()

    if brand:
        promos = [p for p in promos if p["brand"].lower() == brand.lower()]
    if retailer:
        promos = [p for p in promos if p["retailer"].lower() == retailer.lower()]

    return {
        "promotions": promos,
        "total_count": len(promos)
    }

# Market intelligence endpoints
@app.get("/api/market/brand-comparison")
def get_brand_comparison():
    return {"brands": MOCK_BRANDS}

@app.get("/api/market/retailer-comparison")
def get_retailer_comparison():
    return {"retailers": MOCK_RETAILERS}

# Monitoring endpoints
@app.get("/api/scrapers/logs")
def get_scraper_logs(limit: int = 50):
    logs = [
        {
            "id": 1,
            "retailer": "Courts Mauritius",
            "status": "success",
            "products_found": 35,
            "errors": None,
            "execution_time_ms": 4500,
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": 2,
            "retailer": "Galaxy",
            "status": "success",
            "products_found": 28,
            "errors": None,
            "execution_time_ms": 3800,
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": 3,
            "retailer": "Price Guru",
            "status": "success",
            "products_found": 32,
            "errors": None,
            "execution_time_ms": 5200,
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": 4,
            "retailer": "361 Degrees",
            "status": "partial",
            "products_found": 25,
            "errors": "Some products could not be normalized",
            "execution_time_ms": 6100,
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat()
        },
    ]

    return {
        "logs": logs[:limit],
        "total_count": len(logs)
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("MobiMEA Intelligence API - DEMO MODE")
    print("="*60)
    print("Using mock data - no database required")
    print("Server running at: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Frontend: http://localhost:5177")
    print("="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
