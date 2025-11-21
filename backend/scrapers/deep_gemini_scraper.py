"""
Deep Gemini Scraper - Extracts complete phone specs from detail pages
Clicks into each product to get full specifications for comparison app
"""

import google.generativeai as genai
from playwright.async_api import async_playwright, Page
import asyncio
import base64
import json
import os
import re
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

class DeepGeminiScraper:
    """AI-powered deep scraper that extracts complete phone specifications"""

    def __init__(self, retailer_name: str, url: str):
        self.retailer_name = retailer_name
        self.url = url
        self.api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.products = []
        self.max_products = 50  # Limit for testing

    async def take_screenshot(self, page: Page) -> bytes:
        """Take a screenshot of the current page"""
        return await page.screenshot(full_page=False)

    async def extract_product_links(self, page: Page) -> List[str]:
        """Extract all phone product links from listing page"""
        print("[EXTRACT] Finding product links...")

        # Scroll to load all products
        for i in range(3):
            await page.evaluate('window.scrollBy(0, window.innerHeight)')
            await page.wait_for_timeout(1000)

        # Get screenshot
        screenshot = await self.take_screenshot(page)
        screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')

        prompt = f"""Analyze this product listing page from {self.retailer_name}.

Extract ALL phone product links visible on the page.

Return ONLY a JSON array of product URLs:
["url1", "url2", "url3", ...]

IMPORTANT:
- Include ONLY phone products (smartphones)
- Extract the full URL or relative path
- Skip accessories, cases, tablets
- Be thorough - get ALL phones visible
"""

        try:
            response = self.model.generate_content([
                {'mime_type': 'image/png', 'data': screenshot_b64},
                prompt
            ])

            text = response.text.strip()
            text = re.sub(r'```json\n?|\n?```', '', text).strip()

            # Extract JSON array
            json_match = re.search(r'\[[\s\S]*\]', text)
            if json_match:
                links = json.loads(json_match.group(0))
                print(f"[FOUND] {len(links)} product links")
                return links
            else:
                print("[WARN] No links found in response")
                return []

        except Exception as e:
            print(f"[ERROR] Failed to extract links: {e}")
            return []

    async def scrape_product_details(self, page: Page, product_url: str, index: int, total: int) -> Dict:
        """Navigate to product page and extract complete specifications"""
        print(f"\n[{index}/{total}] Scraping product details...")
        print(f"[URL] {product_url}")

        try:
            # Navigate to product page
            await page.goto(product_url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)

            # Scroll to load all content
            await page.evaluate('window.scrollBy(0, document.body.scrollHeight / 2)')
            await page.wait_for_timeout(1000)

            # Take screenshot
            screenshot = await self.take_screenshot(page)
            screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')

            # Get HTML for additional context
            html = await page.content()

            prompt = f"""Analyze this phone product detail page from {self.retailer_name} and extract COMPLETE specifications.

Extract ALL available information in this exact JSON format:
{{
    "name": "Full product name with brand, model, storage, color",
    "brand": "Brand name (Samsung, Apple, Honor, Xiaomi, etc.)",
    "model": "Model name (Galaxy S24 Ultra, iPhone 15 Pro, etc.)",
    "variant": "Storage and color (512GB Black, 256GB Blue, etc.)",

    "pricing": {{
        "cash_price": 45990,
        "credit_price": 48990,
        "original_price": 52990,
        "discount_amount": 7000,
        "discount_percent": 13,
        "currency": "MUR",
        "in_stock": true,
        "stock_status": "In Stock / Out of Stock / Pre-order"
    }},

    "specifications": {{
        "display": {{
            "size": "6.8 inches",
            "resolution": "3088 x 1440",
            "type": "AMOLED",
            "refresh_rate": "120Hz"
        }},
        "processor": {{
            "chipset": "Snapdragon 8 Gen 3",
            "cpu": "Octa-core",
            "gpu": "Adreno 750"
        }},
        "memory": {{
            "ram": "12GB",
            "storage": "512GB",
            "expandable": "No"
        }},
        "camera": {{
            "main": "200MP f/1.7",
            "ultrawide": "12MP f/2.2",
            "telephoto": "50MP 5x optical zoom",
            "front": "12MP f/2.2",
            "features": ["Night mode", "8K video", "Pro mode"]
        }},
        "battery": {{
            "capacity": "5000mAh",
            "fast_charging": "45W",
            "wireless_charging": "15W"
        }},
        "connectivity": {{
            "network": "5G",
            "wifi": "Wi-Fi 7",
            "bluetooth": "5.3",
            "nfc": true,
            "usb": "USB-C 3.2"
        }},
        "software": {{
            "os": "Android 14",
            "ui": "One UI 6.1"
        }},
        "physical": {{
            "dimensions": "162.3 x 79 x 8.6 mm",
            "weight": "232g",
            "build": "Glass front/back, Aluminum frame",
            "colors": ["Black", "Gray", "Violet"]
        }}
    }},

    "images": ["image1_url", "image2_url", "image3_url"],
    "url": "{product_url}",
    "retailer": "{self.retailer_name}"
}}

HTML Context (first 3000 chars):
{html[:3000]}

CRITICAL INSTRUCTIONS:
- Extract EVERY spec you can find
- If a field is not available, use null
- Prices should be integers (45990 not "Rs 45,990")
- Be thorough - this data is for phone comparison app
- Include all camera lenses
- Get exact display, processor, RAM details
- Extract all available images
"""

            response = self.model.generate_content([
                {'mime_type': 'image/png', 'data': screenshot_b64},
                prompt
            ])

            text = response.text.strip()
            text = re.sub(r'```json\n?|\n?```', '', text).strip()

            # Extract JSON
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                product_data = json.loads(json_match.group(0))
                print(f"[SUCCESS] Extracted: {product_data.get('name', 'Unknown')}")
                print(f"[PRICE] Rs {product_data.get('pricing', {}).get('cash_price', 'N/A')}")
                return product_data
            else:
                print("[WARN] Could not parse product data")
                return None

        except Exception as e:
            print(f"[ERROR] Failed to scrape {product_url}: {e}")
            return None

    async def scrape(self) -> List[Dict]:
        """Main scraping method - deep dive into each product"""
        print(f"\n[START] Deep Gemini Scraper for {self.retailer_name}")
        print(f"[URL] {self.url}")
        print("[MODE] Deep scraping with complete specs\n")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

            # Step 1: Get all product links
            print("[STEP 1] Loading product listing page...")
            await page.goto(self.url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)

            product_links = await self.extract_product_links(page)

            if not product_links:
                print("[ERROR] No product links found!")
                await browser.close()
                return []

            # Limit for testing
            product_links = product_links[:self.max_products]
            print(f"\n[STEP 2] Scraping {len(product_links)} products in detail...\n")

            # Step 2: Scrape each product
            for i, link in enumerate(product_links, 1):
                # Make absolute URL if relative
                if link.startswith('/'):
                    full_url = f"https://www.courtsmammouth.mu{link}"
                elif not link.startswith('http'):
                    full_url = f"https://www.courtsmammouth.mu/{link}"
                else:
                    full_url = link

                product_data = await self.scrape_product_details(page, full_url, i, len(product_links))

                if product_data:
                    self.products.append(product_data)

                # Small delay to be respectful
                await page.wait_for_timeout(2000)

            await browser.close()

        print(f"\n[COMPLETE] Scraped {len(self.products)} products with full specs!\n")
        return self.products


# Test function
async def test_deep_scraper():
    """Test deep scraper on Courts"""
    scraper = DeepGeminiScraper(
        retailer_name='Courts Mauritius',
        url='https://www.courtsmammouth.mu/category/mobile-phones.html'
    )

    # Limit to 5 products for testing
    scraper.max_products = 5

    products = await scraper.scrape()

    print("\n" + "="*80)
    print("DEEP SCRAPING RESULTS")
    print("="*80)

    for i, product in enumerate(products, 1):
        print(f"\n[{i}] {product.get('name', 'Unknown')}")
        print(f"    Brand: {product.get('brand')}")
        print(f"    Price: Rs {product.get('pricing', {}).get('cash_price', 'N/A')}")

        specs = product.get('specifications', {})
        if specs:
            print(f"    Display: {specs.get('display', {}).get('size', 'N/A')}")
            print(f"    Processor: {specs.get('processor', {}).get('chipset', 'N/A')}")
            print(f"    RAM: {specs.get('memory', {}).get('ram', 'N/A')}")
            print(f"    Camera: {specs.get('camera', {}).get('main', 'N/A')}")
            print(f"    Battery: {specs.get('battery', {}).get('capacity', 'N/A')}")

    print(f"\n{'='*80}")
    print(f"Total products scraped: {len(products)}")
    print("="*80)

    # Save to JSON file
    with open('deep_scrape_results.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print("\n[SAVED] Results saved to deep_scrape_results.json")


if __name__ == '__main__':
    asyncio.run(test_deep_scraper())
