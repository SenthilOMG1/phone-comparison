from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import Dict, List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    """Handle all database operations for the scraping system"""

    def __init__(self, db_url: str = None):
        self.db_url = db_url or os.getenv('DATABASE_URL')
        self.engine = create_engine(self.db_url)
        self.Session = sessionmaker(bind=self.engine)

    def save_scrape_result(self, retailer_name: str, result: Dict, normalized_products: List[Dict]):
        """Save complete scraping results to database"""

        session = self.Session()

        try:
            # Get retailer ID
            retailer = session.execute(
                text("SELECT id FROM retailers WHERE name = :name"),
                {'name': retailer_name}
            ).fetchone()

            if not retailer:
                raise Exception(f"Retailer {retailer_name} not found in database")

            retailer_id = retailer[0]

            # Log the scrape attempt
            session.execute(text("""
                INSERT INTO scraper_logs (retailer, status, products_found, execution_time_ms, errors)
                VALUES (:retailer, :status, :products_found, :execution_time, :errors)
            """), {
                'retailer': retailer_name,
                'status': result['status'],
                'products_found': result['products_found'],
                'execution_time': result['execution_time_ms'],
                'errors': '; '.join(result['errors']) if result['errors'] else None
            })

            # Update retailer last_scraped_at
            session.execute(text("""
                UPDATE retailers SET last_scraped_at = NOW() WHERE id = :retailer_id
            """), {'retailer_id': retailer_id})

            # Process each product
            products_updated = 0
            for raw_product, normalized in zip(result['products'], normalized_products):
                if 'error' not in normalized:
                    self._save_product_price(session, retailer_id, raw_product, normalized)
                    products_updated += 1

            # Update scraper log with products_saved count
            session.execute(text("""
                UPDATE scraper_logs
                SET products_saved = :count
                WHERE retailer = :retailer
                  AND created_at = (SELECT MAX(created_at) FROM scraper_logs WHERE retailer = :retailer)
            """), {'count': products_updated, 'retailer': retailer_name})

            session.commit()
            print(f"Successfully saved {products_updated} products from {retailer_name}")

        except Exception as e:
            session.rollback()
            print(f"Database error: {e}")
            raise e
        finally:
            session.close()

    def _save_product_price(self, session, retailer_id: int, raw_product: Dict, normalized: Dict):
        """Save or update a product and its price"""

        slug = normalized['slug']

        # Find or create product
        product = session.execute(
            text("SELECT id FROM products WHERE slug = :slug"),
            {'slug': slug}
        ).fetchone()

        if not product:
            # Create new product
            result = session.execute(text("""
                INSERT INTO products (name, brand, model, variant, slug)
                VALUES (:name, :brand, :model, :variant, :slug)
                RETURNING id
            """), {
                'name': normalized['normalized_name'],
                'brand': normalized['brand'],
                'model': normalized['model'],
                'variant': normalized.get('variant', ''),
                'slug': slug
            })
            product_id = result.fetchone()[0]
        else:
            product_id = product[0]
            # Update product info
            session.execute(text("""
                UPDATE products
                SET updated_at = NOW(),
                    variant = COALESCE(:variant, variant)
                WHERE id = :id
            """), {'id': product_id, 'variant': normalized.get('variant', '')})

        # Find or create retailer link
        link = session.execute(text("""
            SELECT id FROM retailer_links
            WHERE product_id = :product_id AND retailer_id = :retailer_id
        """), {'product_id': product_id, 'retailer_id': retailer_id}).fetchone()

        if not link:
            result = session.execute(text("""
                INSERT INTO retailer_links (product_id, retailer_id, original_url, scraped_name)
                VALUES (:product_id, :retailer_id, :url, :scraped_name)
                RETURNING id
            """), {
                'product_id': product_id,
                'retailer_id': retailer_id,
                'url': raw_product.get('url'),
                'scraped_name': raw_product['name']
            })
            link_id = result.fetchone()[0]
        else:
            link_id = link[0]
            # Update last_seen and scraped name
            session.execute(text("""
                UPDATE retailer_links
                SET last_seen_at = NOW(),
                    scraped_name = :scraped_name,
                    original_url = COALESCE(:url, original_url)
                WHERE id = :id
            """), {
                'id': link_id,
                'scraped_name': raw_product['name'],
                'url': raw_product.get('url')
            })

        # Insert price record (time-series data)
        session.execute(text("""
            INSERT INTO prices (link_id, price_cash, price_credit, original_price, in_stock, stock_status, promo_text)
            VALUES (:link_id, :price_cash, :price_credit, :original_price, :in_stock, :stock_status, :promo_text)
        """), {
            'link_id': link_id,
            'price_cash': raw_product.get('price_cash'),
            'price_credit': raw_product.get('price_credit'),
            'original_price': raw_product.get('original_price'),
            'in_stock': raw_product.get('in_stock', True),
            'stock_status': raw_product.get('stock_status', 'in_stock'),
            'promo_text': raw_product.get('promo_text')
        })

    def get_latest_prices(self, limit: int = 100) -> List[Dict]:
        """Get latest prices for all products"""

        session = self.Session()
        try:
            result = session.execute(text("""
                SELECT
                    product_id,
                    product_name,
                    brand,
                    model,
                    slug,
                    retailer_name,
                    price_cash,
                    original_price,
                    in_stock,
                    stock_status,
                    promo_text,
                    original_url,
                    last_updated
                FROM latest_prices
                ORDER BY last_updated DESC
                LIMIT :limit
            """), {'limit': limit}).fetchall()

            return [
                {
                    'product_id': row[0],
                    'product_name': row[1],
                    'brand': row[2],
                    'model': row[3],
                    'slug': row[4],
                    'retailer_name': row[5],
                    'price_cash': float(row[6]) if row[6] else None,
                    'original_price': float(row[7]) if row[7] else None,
                    'in_stock': row[8],
                    'stock_status': row[9],
                    'promo_text': row[10],
                    'url': row[11],
                    'last_updated': row[12].isoformat() if row[12] else None
                }
                for row in result
            ]
        finally:
            session.close()

    def get_dashboard_stats(self) -> Dict:
        """Get statistics for dashboard"""

        session = self.Session()
        try:
            result = session.execute(text("""
                SELECT
                    total_products,
                    active_retailers,
                    products_in_stock,
                    active_promotions,
                    last_scrape_time
                FROM dashboard_stats
            """)).fetchone()

            if result:
                return {
                    'total_products': result[0],
                    'active_retailers': result[1],
                    'products_in_stock': result[2],
                    'active_promotions': result[3],
                    'last_scrape_time': result[4].isoformat() if result[4] else None
                }
            return {}
        finally:
            session.close()

    def get_product_by_slug(self, slug: str) -> Optional[Dict]:
        """Get product details with all retailer prices"""

        session = self.Session()
        try:
            # Get product info
            product = session.execute(text("""
                SELECT id, name, brand, model, variant, slug
                FROM products
                WHERE slug = :slug
            """), {'slug': slug}).fetchone()

            if not product:
                return None

            product_id = product[0]

            # Get all current prices from different retailers
            prices = session.execute(text("""
                SELECT
                    retailer_name,
                    price_cash,
                    original_price,
                    in_stock,
                    stock_status,
                    promo_text,
                    original_url,
                    last_updated
                FROM latest_prices
                WHERE product_id = :product_id
                ORDER BY price_cash ASC NULLS LAST
            """), {'product_id': product_id}).fetchall()

            return {
                'id': product[0],
                'name': product[1],
                'brand': product[2],
                'model': product[3],
                'variant': product[4],
                'slug': product[5],
                'prices': [
                    {
                        'retailer': row[0],
                        'price': float(row[1]) if row[1] else None,
                        'original_price': float(row[2]) if row[2] else None,
                        'in_stock': row[3],
                        'stock_status': row[4],
                        'promo_text': row[5],
                        'url': row[6],
                        'last_updated': row[7].isoformat() if row[7] else None
                    }
                    for row in prices
                ]
            }
        finally:
            session.close()
