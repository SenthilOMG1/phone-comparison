"""
Test script for scrapers
Run this to test if scraping works before connecting to database
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scrapers.courts_scraper import CourtsScraper
from utils.gemini_normalizer import ProductNormalizer

async def test_courts_scraper():
    """Test Courts scraper"""
    print("=" * 60)
    print("TESTING COURTS SCRAPER")
    print("=" * 60)

    scraper = CourtsScraper()
    result = await scraper.scrape()

    print(f"\nStatus: {result['status']}")
    print(f"Products found: {result['products_found']}")
    print(f"Execution time: {result['execution_time_ms']}ms")

    if result['errors']:
        print(f"\nErrors:")
        for error in result['errors']:
            print(f"  - {error}")

    if result['products']:
        print(f"\nFirst 5 products:")
        for i, product in enumerate(result['products'][:5], 1):
            print(f"\n{i}. {product['name']}")
            print(f"   Price: Rs {product['price_cash']}")
            if product['original_price']:
                print(f"   Original: Rs {product['original_price']}")
            print(f"   Stock: {product['stock_status']}")
            if product['promo_text']:
                print(f"   Promo: {product['promo_text']}")
            if product['url']:
                print(f"   URL: {product['url'][:60]}...")

    return result

async def test_normalization(products):
    """Test product normalization with Gemini"""
    print("\n" + "=" * 60)
    print("TESTING GEMINI NORMALIZATION")
    print("=" * 60)

    normalizer = ProductNormalizer()

    if products:
        print(f"\nNormalizing first 3 products...")
        for i, product in enumerate(products[:3], 1):
            raw_name = product['name']
            print(f"\n{i}. Raw: {raw_name}")

            normalized = normalizer.normalize(raw_name)

            if 'error' not in normalized:
                print(f"   Brand: {normalized['brand']}")
                print(f"   Model: {normalized['model']}")
                print(f"   Variant: {normalized['variant']}")
                print(f"   Normalized: {normalized['normalized_name']}")
                print(f"   Slug: {normalized['slug']}")
            else:
                print(f"   Error: {normalized['error']}")

async def main():
    """Main test function"""
    try:
        # Test scraper
        result = await test_courts_scraper()

        # Test normalization if products were found
        if result['products']:
            await test_normalization(result['products'])
        else:
            print("\nNo products found to test normalization")

        print("\n" + "=" * 60)
        print("TEST COMPLETE")
        print("=" * 60)

    except Exception as e:
        print(f"\n ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    # Install Playwright browsers first if not done
    # Run: playwright install chromium

    print("Starting scraper test...")
    print("Note: First run may take time to install browser")
    print()

    asyncio.run(main())
