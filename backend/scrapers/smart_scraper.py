"""
Smart scraper that combines traditional scraping with Gemini intelligence
Uses Playwright for extraction and Gemini for understanding/normalization
"""

import google.generativeai as genai
from playwright.async_api import async_playwright, Page
import asyncio
import json
import os
import re
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

class SmartScraper:
    """Hybrid scraper using Playwright + Gemini for product understanding"""

    def __init__(self, retailer_name: str, url: str):
        self.retailer_name = retailer_name
        self.url = url
        self.api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.api_key)
        # Use Gemini for text analysis only (no vision, cheaper)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.products = []

    async def extract_product_cards(self, page: Page) -> List[Dict]:
        """Extract raw product data using Playwright"""
        print(f"[EXTRACT] Finding product cards on {self.retailer_name}...")

        # Common selectors for e-commerce sites
        selectors = [
            '.product-item',
            '.product-card',
            '.product',
            '[class*="product"]',
            '.item',
        ]

        products = []

        for selector in selectors:
            elements = await page.query_selector_all(selector)
            if len(elements) > 5:  # Found a good selector
                print(f"[FOUND] {len(elements)} products using selector: {selector}")

                for elem in elements:
                    try:
                        # Extract text content
                        text = await elem.inner_text()

                        # Extract link
                        link_elem = await elem.query_selector('a')
                        url = await link_elem.get_attribute('href') if link_elem else ''

                        # Extract image
                        img_elem = await elem.query_selector('img')
                        image = await img_elem.get_attribute('src') if img_elem else ''

                        if text and len(text) > 10:  # Valid product
                            products.append({
                                'raw_text': text,
                                'url': url,
                                'image': image
                            })
                    except:
                        continue

                break  # Found valid products

        return products

    def parse_with_gemini(self, raw_products: List[Dict]) -> List[Dict]:
        """Use Gemini to intelligently parse product data"""
        print(f"[AI] Analyzing {len(raw_products)} products with Gemini...")

        parsed_products = []

        # Batch process to save API calls
        batch_size = 5
        for i in range(0, len(raw_products), batch_size):
            batch = raw_products[i:i+batch_size]

            # Create prompt for batch
            products_text = "\n\n---\n\n".join([
                f"Product {j+1}:\n{p['raw_text']}\nURL: {p['url']}"
                for j, p in enumerate(batch)
            ])

            prompt = f"""Extract phone product information from these product listings from {self.retailer_name} in Mauritius.

Products:
{products_text}

For EACH product, extract:
- name: Full product name (brand, model, storage, color)
- price: Price in Mauritian Rupees as integer (e.g., 45990)
- price_text: Original price string (e.g., "Rs 45,990")
- in_stock: true/false
- url: Product URL
- brand: Phone brand (Samsung, Apple, Honor, etc.)

Respond ONLY with valid JSON array:
[
  {{
    "name": "Samsung Galaxy S24 Ultra 512GB Black",
    "price": 45990,
    "price_text": "Rs 45,990",
    "in_stock": true,
    "url": "/product-url",
    "brand": "Samsung"
  }},
  ...
]

IMPORTANT:
- If no price found, use null
- If out of stock, set in_stock to false
- Skip if not a phone product
- Extract ALL valid phones from the batch
"""

            try:
                response = self.model.generate_content(prompt)
                text = response.text.strip()

                # Remove markdown code blocks
                text = re.sub(r'```json\n?|\n?```', '', text).strip()

                # Parse JSON
                batch_products = json.loads(text)
                parsed_products.extend(batch_products)

                print(f"[PARSED] Batch {i//batch_size + 1}: {len(batch_products)} products")

            except Exception as e:
                print(f"[ERROR] Gemini parsing failed: {e}")
                continue

        return parsed_products

    async def scrape(self) -> List[Dict]:
        """Main scraping method"""
        print(f"\n[START] Smart scraping {self.retailer_name}")
        print(f"[URL] {self.url}\n")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

            # Load page
            print("[WEB] Loading page...")
            await page.goto(self.url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)

            # Scroll to load lazy content
            print("[WEB] Scrolling to load all products...")
            for i in range(3):
                await page.evaluate('window.scrollBy(0, window.innerHeight)')
                await page.wait_for_timeout(1000)

            # Extract product cards
            raw_products = await self.extract_product_cards(page)

            await browser.close()

        if not raw_products:
            print("[WARN] No products found!")
            return []

        # Parse with Gemini
        parsed_products = self.parse_with_gemini(raw_products)

        print(f"\n[COMPLETE] Found {len(parsed_products)} valid phone products\n")
        return parsed_products


# Test function
async def test_smart_scraper():
    """Test smart scraper on Courts"""
    scraper = SmartScraper(
        retailer_name='Courts Mauritius',
        url='https://www.courtsmammouth.mu/category/mobile-phones.html'
    )

    products = await scraper.scrape()

    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    for i, product in enumerate(products[:10], 1):
        print(f"{i}. {product.get('name')} - Rs {product.get('price')}")
    print(f"\nTotal: {len(products)} products")


if __name__ == '__main__':
    asyncio.run(test_smart_scraper())
