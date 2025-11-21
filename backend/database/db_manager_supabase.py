from supabase import create_client, Client
from typing import Dict, List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    """Handle all database operations using Supabase Python client"""

    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_ANON_KEY')
        self.client: Client = create_client(self.supabase_url, self.supabase_key)

    def save_scrape_result(self, retailer_name: str, result: Dict, normalized_products: List[Dict]):
        """Save complete scraping results to database"""

        try:
            # Get retailer ID
            retailer_response = self.client.table('retailers').select('id').eq('name', retailer_name).execute()

            if not retailer_response.data:
                raise Exception(f"Retailer {retailer_name} not found in database")

            retailer_id = retailer_response.data[0]['id']

            # Log the scrape attempt
            self.client.table('scraper_logs').insert({
                'retailer': retailer_name,
                'status': result['status'],
                'products_found': result['products_found'],
                'execution_time_ms': result['execution_time_ms'],
                'errors': '; '.join(result['errors']) if result['errors'] else None,
                'products_saved': 0  # Will update later
            }).execute()

            # Update retailer last_scraped_at
            self.client.table('retailers').update({
                'last_scraped_at': datetime.now().isoformat()
            }).eq('id', retailer_id).execute()

            # Process each product
            products_updated = 0
            for raw_product, normalized in zip(result['products'], normalized_products):
                if 'error' not in normalized:
                    self._save_product_price(retailer_id, raw_product, normalized)
                    products_updated += 1

            # Update scraper log with products_saved count
            # Get the most recent log for this retailer
            recent_log = self.client.table('scraper_logs')\
                .select('id')\
                .eq('retailer', retailer_name)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()

            if recent_log.data:
                self.client.table('scraper_logs').update({
                    'products_saved': products_updated
                }).eq('id', recent_log.data[0]['id']).execute()

            print(f"Successfully saved {products_updated} products from {retailer_name}")

        except Exception as e:
            print(f"Database error: {e}")
            raise e

    def _save_product_price(self, retailer_id: int, raw_product: Dict, normalized: Dict):
        """Save or update a product and its price"""

        slug = normalized['slug']

        # Find or create product
        product_response = self.client.table('products').select('id').eq('slug', slug).execute()

        if not product_response.data:
            # Create new product
            new_product = self.client.table('products').insert({
                'name': normalized['normalized_name'],
                'brand': normalized['brand'],
                'model': normalized['model'],
                'variant': normalized.get('variant', ''),
                'slug': slug
            }).execute()
            product_id = new_product.data[0]['id']
        else:
            product_id = product_response.data[0]['id']
            # Update product info
            self.client.table('products').update({
                'updated_at': datetime.now().isoformat(),
                'variant': normalized.get('variant', '')
            }).eq('id', product_id).execute()

        # Find or create retailer link
        link_response = self.client.table('retailer_links')\
            .select('id')\
            .eq('product_id', product_id)\
            .eq('retailer_id', retailer_id)\
            .execute()

        if not link_response.data:
            new_link = self.client.table('retailer_links').insert({
                'product_id': product_id,
                'retailer_id': retailer_id,
                'original_url': raw_product.get('url'),
                'scraped_name': raw_product['name']
            }).execute()
            link_id = new_link.data[0]['id']
        else:
            link_id = link_response.data[0]['id']
            # Update last_seen and scraped name
            self.client.table('retailer_links').update({
                'last_seen_at': datetime.now().isoformat(),
                'scraped_name': raw_product['name'],
                'original_url': raw_product.get('url') or link_response.data[0].get('original_url')
            }).eq('id', link_id).execute()

        # Insert price record (time-series data)
        self.client.table('prices').insert({
            'link_id': link_id,
            'price_cash': raw_product.get('price_cash'),
            'price_credit': raw_product.get('price_credit'),
            'original_price': raw_product.get('original_price'),
            'in_stock': raw_product.get('in_stock', True),
            'stock_status': raw_product.get('stock_status', 'in_stock'),
            'promo_text': raw_product.get('promo_text')
        }).execute()

    def get_latest_prices(self, limit: int = 100) -> List[Dict]:
        """Get latest prices for all products"""

        try:
            # Query the latest_prices view
            result = self.client.table('latest_prices')\
                .select('*')\
                .order('last_updated', desc=True)\
                .limit(limit)\
                .execute()

            return [
                {
                    'product_id': row['product_id'],
                    'product_name': row['product_name'],
                    'brand': row['brand'],
                    'model': row['model'],
                    'slug': row['slug'],
                    'retailer_name': row['retailer'],  # View column is 'retailer'
                    'price_cash': float(row['price']) if row.get('price') else None,  # View column is 'price'
                    'original_price': float(row['original_price']) if row.get('original_price') else None,
                    'in_stock': row['in_stock'],
                    'stock_status': row['stock_status'],
                    'promo_text': row.get('promo_text'),
                    'url': row.get('url'),  # View column is 'url'
                    'last_updated': row['last_updated']
                }
                for row in result.data
            ]
        except Exception as e:
            print(f"Error getting latest prices: {e}")
            return []

    def get_dashboard_stats(self) -> Dict:
        """Get statistics for dashboard"""

        try:
            result = self.client.table('dashboard_stats').select('*').execute()

            if result.data:
                row = result.data[0]
                return {
                    'total_products': row['total_products'],
                    'active_retailers': row['active_retailers'],
                    'products_in_stock': row['products_in_stock'],
                    'active_promotions': row['active_promotions'],
                    'last_scrape_time': row.get('last_scrape_time')
                }
            return {}
        except Exception as e:
            print(f"Error getting dashboard stats: {e}")
            return {}

    def get_product_by_slug(self, slug: str) -> Optional[Dict]:
        """Get product details with all retailer prices"""

        try:
            # Get product info
            product_response = self.client.table('products')\
                .select('id, name, brand, model, variant, slug')\
                .eq('slug', slug)\
                .execute()

            if not product_response.data:
                return None

            product = product_response.data[0]
            product_id = product['id']

            # Get all current prices from different retailers
            prices_response = self.client.table('latest_prices')\
                .select('*')\
                .eq('product_id', product_id)\
                .order('price_cash')\
                .execute()

            return {
                'id': product['id'],
                'name': product['name'],
                'brand': product['brand'],
                'model': product['model'],
                'variant': product.get('variant'),
                'slug': product['slug'],
                'prices': [
                    {
                        'retailer': row['retailer'],  # View column is 'retailer'
                        'price': float(row['price']) if row.get('price') else None,  # View column is 'price'
                        'original_price': float(row['original_price']) if row.get('original_price') else None,
                        'in_stock': row['in_stock'],
                        'stock_status': row['stock_status'],
                        'promo_text': row.get('promo_text'),
                        'url': row.get('url'),  # View column is 'url'
                        'last_updated': row['last_updated']
                    }
                    for row in prices_response.data
                ]
            }
        except Exception as e:
            print(f"Error getting product by slug: {e}")
            return None

    def get_scraper_logs(self, limit: int = 20) -> Dict:
        """Get recent scraper execution logs"""
        try:
            result = self.client.table('scraper_logs')\
                .select('*')\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()

            logs = [
                {
                    'id': row['id'],
                    'retailer': row['retailer'],
                    'status': row['status'],
                    'products_found': row.get('products_found', 0),
                    'products_saved': row.get('products_saved', 0),
                    'errors': row.get('errors'),
                    'execution_time_ms': row.get('execution_time_ms'),
                    'created_at': row['created_at']
                }
                for row in result.data
            ]

            return {
                'total_count': len(logs),
                'logs': logs
            }
        except Exception as e:
            print(f"Error getting scraper logs: {e}")
            return {'total_count': 0, 'logs': []}

    async def save_scraped_product(self, product_data: Dict) -> bool:
        """Save detailed scraped product with full specifications"""
        try:
            # Generate slug from product name
            slug = product_data['name'].lower().replace(' ', '-').replace('/', '-')
            slug = ''.join(c for c in slug if c.isalnum() or c == '-')

            # Find or create product
            product_response = self.client.table('products').select('id').eq('slug', slug).execute()

            if not product_response.data:
                # Create new product with specifications
                new_product = self.client.table('products').insert({
                    'name': product_data['name'],
                    'brand': product_data['brand'],
                    'model': product_data['model'],
                    'variant': product_data.get('variant', ''),
                    'slug': slug,
                    'specifications': product_data.get('specifications', {}),
                    'images': product_data.get('images', [])
                }).execute()
                product_id = new_product.data[0]['id']
            else:
                product_id = product_response.data[0]['id']
                # Update product with latest specs
                self.client.table('products').update({
                    'updated_at': datetime.now().isoformat(),
                    'specifications': product_data.get('specifications', {}),
                    'images': product_data.get('images', [])
                }).eq('id', product_id).execute()

            # Find retailer ID
            retailer_response = self.client.table('retailers').select('id').eq('name', product_data['retailer']).execute()

            if not retailer_response.data:
                # Create retailer if doesn't exist
                new_retailer = self.client.table('retailers').insert({
                    'name': product_data['retailer'],
                    'website_url': product_data.get('url', '').split('/product/')[0] if '/product/' in product_data.get('url', '') else ''
                }).execute()
                retailer_id = new_retailer.data[0]['id']
            else:
                retailer_id = retailer_response.data[0]['id']

            # Find or create retailer link
            link_response = self.client.table('retailer_links')\
                .select('id')\
                .eq('product_id', product_id)\
                .eq('retailer_id', retailer_id)\
                .execute()

            if not link_response.data:
                new_link = self.client.table('retailer_links').insert({
                    'product_id': product_id,
                    'retailer_id': retailer_id,
                    'original_url': product_data.get('url'),
                    'scraped_name': product_data['name']
                }).execute()
                link_id = new_link.data[0]['id']
            else:
                link_id = link_response.data[0]['id']
                self.client.table('retailer_links').update({
                    'last_seen_at': datetime.now().isoformat(),
                    'scraped_name': product_data['name'],
                    'original_url': product_data.get('url')
                }).eq('id', link_id).execute()

            # Insert price record
            self.client.table('prices').insert({
                'link_id': link_id,
                'price_cash': product_data.get('price_cash'),
                'price_credit': product_data.get('price_credit'),
                'original_price': product_data.get('original_price'),
                'in_stock': product_data.get('in_stock', True),
                'stock_status': 'in_stock' if product_data.get('in_stock', True) else 'out_of_stock'
            }).execute()

            return True

        except Exception as e:
            print(f"Error saving scraped product: {e}")
            return False

    def get_brand_comparison(self) -> Dict:
        """Compare average prices across brands"""
        try:
            # Use RPC function or aggregate via latest_prices view
            result = self.client.rpc('get_brand_comparison').execute()

            if result.data:
                return {'brands': result.data}
            else:
                # Fallback: aggregate manually from latest_prices
                prices = self.client.table('latest_prices').select('*').execute()
                brands_data = {}

                for row in prices.data:
                    brand = row['brand']
                    if brand not in brands_data:
                        brands_data[brand] = {
                            'brand': brand,
                            'products': set(),
                            'prices': [],
                            'in_stock_count': 0
                        }

                    brands_data[brand]['products'].add(row['product_id'])
                    if row.get('price_cash'):
                        brands_data[brand]['prices'].append(float(row['price_cash']))
                    if row.get('in_stock'):
                        brands_data[brand]['in_stock_count'] += 1

                # Calculate aggregates
                brands = []
                for brand, data in brands_data.items():
                    if data['prices']:
                        brands.append({
                            'brand': brand,
                            'product_count': len(data['products']),
                            'avg_price': sum(data['prices']) / len(data['prices']),
                            'min_price': min(data['prices']),
                            'max_price': max(data['prices']),
                            'in_stock_count': data['in_stock_count']
                        })

                brands.sort(key=lambda x: x['avg_price'], reverse=True)
                return {'brands': brands}

        except Exception as e:
            print(f"Error getting brand comparison: {e}")
            return {'brands': []}
