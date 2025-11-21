"""
Unified Scraper Orchestrator
Runs scrapers in configured mode (agentic or hybrid) and saves to Supabase
"""

import asyncio
import json
from datetime import datetime
from typing import List, Dict
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.hybrid_deep_scraper import HybridDeepScraper
from scrapers.agentic_gemini_scraper import AgenticGeminiScraper
from scrapers.scraper_config import get_scraper_mode, get_enabled_retailers, get_max_products
from database.db_manager_supabase import DatabaseManager

class UnifiedScraperOrchestrator:
    """Orchestrates all scrapers with configurable mode"""

    def __init__(self):
        self.db = DatabaseManager()
        self.mode = get_scraper_mode()
        self.max_products = get_max_products()
        self.results = []

    def get_scraper_for_retailer(self, retailer_name: str, url: str):
        """Get appropriate scraper based on mode"""
        if self.mode == 'agentic':
            print(f"[MODE] Using AGENTIC scraper for {retailer_name}")
            return AgenticGeminiScraper(retailer_name, url)
        else:
            print(f"[MODE] Using HYBRID scraper for {retailer_name}")
            return HybridDeepScraper(retailer_name, url)

    async def scrape_retailer(self, retailer: Dict) -> Dict:
        """Scrape a single retailer"""
        retailer_name = retailer['name']
        url = retailer['url']

        print(f"\n{'='*80}")
        print(f"SCRAPING: {retailer_name}")
        print(f"URL: {url}")
        print(f"MODE: {self.mode.upper()}")
        print(f"{'='*80}\n")

        start_time = datetime.now()

        try:
            scraper = self.get_scraper_for_retailer(retailer_name, url)
            scraper.max_products = self.max_products
            products = await scraper.scrape()

            execution_time = (datetime.now() - start_time).total_seconds()

            result = {
                'retailer': retailer_name,
                'status': 'success' if products else 'no_products',
                'products_found': len(products),
                'products': products,
                'execution_time_seconds': execution_time,
                'scraped_at': datetime.now().isoformat()
            }

            # Save to database
            if products:
                print(f"\n[DATABASE] Saving {len(products)} products to Supabase...")
                saved_count = await self.save_products_to_db(products, retailer_name)
                result['products_saved'] = saved_count
                print(f"[DATABASE] Saved {saved_count}/{len(products)} products")

            return result

        except Exception as e:
            print(f"[ERROR] Failed to scrape {retailer_name}: {e}")
            return {
                'retailer': retailer_name,
                'status': 'failed',
                'error': str(e),
                'execution_time_seconds': (datetime.now() - start_time).total_seconds()
            }

    async def save_products_to_db(self, products: List[Dict], retailer: str) -> int:
        """Save products to Supabase database"""
        saved_count = 0

        for product in products:
            try:
                # Normalize product data
                normalized = self.normalize_product_data(product, retailer)

                # Save to database
                success = await self.db.save_scraped_product(normalized)
                if success:
                    saved_count += 1

            except Exception as e:
                print(f"[ERROR] Failed to save product {product.get('name')}: {e}")

        return saved_count

    def normalize_product_data(self, product: Dict, retailer: str) -> Dict:
        """Normalize product data for database storage"""
        # Extract pricing
        pricing = product.get('pricing', {})
        cash_price = pricing.get('cash_price')

        # Clean price (remove "Rs " prefix if present)
        if isinstance(cash_price, str):
            cash_price = cash_price.replace('Rs ', '').replace(',', '').strip()
            try:
                cash_price = int(cash_price)
            except:
                cash_price = None

        # Extract specs
        specs = product.get('specifications', {})
        if isinstance(specs, dict):
            # Agentic format
            display = specs.get('display', {})
            processor = specs.get('processor', {})
            memory = specs.get('memory', {})
            camera = specs.get('camera', {})
            battery = specs.get('battery', {})
        else:
            # Hybrid format or string format
            display = {}
            processor = {}
            memory = {}
            camera = {}
            battery = {}

        return {
            'name': product.get('name', ''),
            'brand': product.get('brand', ''),
            'model': product.get('model', ''),
            'variant': product.get('variant', ''),
            'retailer': retailer,
            'url': product.get('url', ''),
            'price_cash': cash_price,
            'price_credit': pricing.get('credit_price'),
            'original_price': pricing.get('original_price'),
            'in_stock': pricing.get('in_stock', True),
            'specifications': {
                'display': display if isinstance(display, dict) else {'raw': str(display)},
                'processor': processor if isinstance(processor, dict) else {'raw': str(processor)},
                'memory': memory if isinstance(memory, dict) else {'raw': str(memory)},
                'camera': camera if isinstance(camera, dict) else {'raw': str(camera)},
                'battery': battery if isinstance(battery, dict) else {'raw': str(battery)},
                'connectivity': specs.get('connectivity', {}),
                'software': specs.get('software', {}),
                'physical': specs.get('physical', {})
            },
            'images': product.get('images', []),
            'raw_data': product  # Keep full data for reference
        }

    async def run_all(self):
        """Run all enabled retailers"""
        retailers = get_enabled_retailers()

        if not retailers:
            print("[WARNING] No retailers enabled in config!")
            return

        print(f"\n{'='*80}")
        print(f"UNIFIED SCRAPER ORCHESTRATOR")
        print(f"Mode: {self.mode.upper()}")
        print(f"Max products per retailer: {self.max_products}")
        print(f"Enabled retailers: {len(retailers)}")
        print(f"{'='*80}\n")

        # Scrape all retailers
        for retailer in retailers:
            result = await self.scrape_retailer(retailer)
            self.results.append(result)

        # Print summary
        self.print_summary()

        # Save summary to file
        self.save_summary()

    def print_summary(self):
        """Print scraping summary"""
        print(f"\n{'='*80}")
        print("SCRAPING SUMMARY")
        print(f"{'='*80}\n")

        total_products = 0
        total_saved = 0

        for result in self.results:
            retailer = result['retailer']
            status = result['status']
            products_found = result.get('products_found', 0)
            products_saved = result.get('products_saved', 0)
            time = result.get('execution_time_seconds', 0)

            print(f"{retailer}:")
            print(f"  Status: {status}")
            print(f"  Products found: {products_found}")
            print(f"  Products saved: {products_saved}")
            print(f"  Execution time: {time:.2f}s")
            print()

            total_products += products_found
            total_saved += products_saved

        print(f"{'='*80}")
        print(f"TOTAL: {total_products} products found, {total_saved} saved to database")
        print(f"{'='*80}\n")

    def save_summary(self):
        """Save summary to JSON file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'scrape_summary_{timestamp}.json'

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'mode': self.mode,
                'timestamp': datetime.now().isoformat(),
                'results': self.results
            }, f, indent=2, ensure_ascii=False)

        print(f"[SAVED] Summary saved to {filename}")


async def main():
    """Main entry point"""
    orchestrator = UnifiedScraperOrchestrator()
    await orchestrator.run_all()


if __name__ == '__main__':
    asyncio.run(main())
