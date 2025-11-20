"""Test Courts pagination to see why we only get 32/172 products"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_courts_pagination():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Show browser
        page = await browser.new_page()

        url = "https://www.courtsmammouth.mu/category/mobile-phones.html"
        print(f"Navigating to: {url}")
        await page.goto(url, wait_until='domcontentloaded', timeout=30000)
        await page.wait_for_timeout(2000)

        # Check initial product count
        products = await page.query_selector_all('.product-miniature')
        print(f"\nInitial products found: {len(products)}")

        # Check for pagination elements
        print("\nChecking for pagination elements...")

        # Check for "Load More" buttons
        load_more_selectors = [
            'button:has-text("Load More")',
            'button:has-text("Show More")',
            'a:has-text("Load More")',
            'a:has-text("Show More")',
            'button:has-text("View More")',
            '.load-more',
            '.show-more',
            '[class*="load-more"]',
            '[class*="show-more"]',
            '.pagination',
            '[class*="pagination"]'
        ]

        for selector in load_more_selectors:
            try:
                element = await page.query_selector(selector)
                if element:
                    text = await element.inner_text()
                    print(f"  ✓ Found: {selector} - Text: {text}")
                else:
                    print(f"  ✗ Not found: {selector}")
            except:
                print(f"  ✗ Error checking: {selector}")

        # Check page text for product count indicator
        print("\nSearching for product count indicators...")
        page_text = await page.inner_text('body')
        if '172' in page_text:
            print(f"  ✓ Found '172' in page text")
            # Try to find the exact context
            lines = page_text.split('\n')
            for i, line in enumerate(lines):
                if '172' in line:
                    print(f"    Context: {line.strip()}")

        # Try scrolling and check if more products load
        print("\nTesting scroll loading...")
        for i in range(5):
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await page.wait_for_timeout(2000)
            products = await page.query_selector_all('.product-miniature')
            print(f"  After scroll {i+1}: {len(products)} products")

        # Check if there are multiple pages (traditional pagination)
        print("\nChecking for page numbers...")
        page_links = await page.query_selector_all('a[href*="page"]')
        print(f"  Found {len(page_links)} page links")
        for link in page_links[:5]:  # Show first 5
            href = await link.get_attribute('href')
            text = await link.inner_text()
            print(f"    {text}: {href}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_courts_pagination())
