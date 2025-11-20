"""
Scraper Orchestrator - Runs all scrapers and saves results to database
"""
import asyncio
import sys
import os
import io

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.courts_scraper import CourtsScraper
from scrapers.galaxy_scraper import GalaxyScraper
from scrapers.priceguru_scraper import PriceGuruScraper
from scrapers.threesixone_scraper import ThreeSixOneScraper
from scrapers.emtel_scraper import EmtelScraper
from scrapers.jkalachand_scraper import JKalachandScraper
from utils.gemini_normalizer import ProductNormalizer
from database.db_manager_supabase import DatabaseManager
from datetime import datetime

class ScraperOrchestrator:
    """Manages scraping across all retailers"""

    def __init__(self):
        self.normalizer = ProductNormalizer()
        self.db_manager = DatabaseManager()
        self.scrapers = [
            CourtsScraper(),
            GalaxyScraper(),
            PriceGuruScraper(),
            ThreeSixOneScraper(),
            EmtelScraper(),
            JKalachandScraper(),
        ]

    async def run_all_scrapers(self):
        """Run all scrapers in parallel"""
        print("=" * 60)
        print("MOBIMEA SCRAPER ORCHESTRATOR")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        tasks = [self.run_scraper(scraper) for scraper in self.scrapers]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Summary
        print("\n" + "=" * 60)
        print("SCRAPING SUMMARY")
        print("=" * 60)

        total_products = 0
        total_errors = 0

        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"\n{self.scrapers[i].retailer_name}: FAILED")
                print(f"  Error: {str(result)}")
                total_errors += 1
            elif result:
                print(f"\n{result['retailer']}: {result['status'].upper()}")
                print(f"  Products found: {result['products_found']}")
                print(f"  Products saved: {result['products_saved']}")
                print(f"  Execution time: {result['execution_time_ms']}ms")
                if result['errors']:
                    print(f"  Errors: {len(result['errors'])}")
                total_products += result['products_saved']

        print(f"\nTotal products saved: {total_products}")
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        return results

    async def run_scraper(self, scraper):
        """Run a single scraper and save results"""
        print(f"\n▶ Starting {scraper.retailer_name}...")

        try:
            # Run scraper
            result = await scraper.scrape()

            if result['products']:
                # Normalize all product names
                print(f"  Normalizing {len(result['products'])} products...")
                normalized_products = []

                for product in result['products']:
                    try:
                        normalized = self.normalizer.normalize(product['name'])
                        normalized_products.append(normalized)
                    except Exception as e:
                        print(f"  ⚠ Normalization error for '{product['name']}': {e}")
                        normalized_products.append({'error': str(e)})

                # Save to database
                print(f"  Saving to database...")
                self.db_manager.save_scrape_result(
                    scraper.retailer_name,
                    result,
                    normalized_products
                )

                products_saved = len([n for n in normalized_products if 'error' not in n])

                print(f"  ✓ Completed - {products_saved} products saved")

                return {
                    'retailer': scraper.retailer_name,
                    'status': result['status'],
                    'products_found': result['products_found'],
                    'products_saved': products_saved,
                    'execution_time_ms': result['execution_time_ms'],
                    'errors': result['errors']
                }
            else:
                print(f"  ⚠ No products found")
                return {
                    'retailer': scraper.retailer_name,
                    'status': 'no_products',
                    'products_found': 0,
                    'products_saved': 0,
                    'execution_time_ms': result['execution_time_ms'],
                    'errors': result['errors']
                }

        except Exception as e:
            print(f"  ✗ Failed: {str(e)}")
            raise e

    async def run_single_retailer(self, retailer_name: str):
        """Run scraper for a specific retailer"""
        scraper = next((s for s in self.scrapers if s.retailer_name == retailer_name), None)

        if not scraper:
            print(f"Retailer '{retailer_name}' not found")
            return None

        return await self.run_scraper(scraper)


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Run MobiMEA scrapers')
    parser.add_argument('--retailer', type=str, help='Run specific retailer only')
    parser.add_argument('--test', action='store_true', help='Test mode - don\'t save to database')

    args = parser.parse_args()

    orchestrator = ScraperOrchestrator()

    if args.test:
        print("TEST MODE - Results will NOT be saved to database\n")
        # Override db_manager save method for testing
        orchestrator.db_manager.save_scrape_result = lambda *args, **kwargs: print("  (Test mode - not saving)")

    if args.retailer:
        await orchestrator.run_single_retailer(args.retailer)
    else:
        await orchestrator.run_all_scrapers()


if __name__ == '__main__':
    asyncio.run(main())
