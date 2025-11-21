"""
Agentic Gemini Scraper - Gemini controls the browser completely
Gemini decides what to click, scroll, navigate - full autonomy
"""

import google.generativeai as genai
from playwright.async_api import async_playwright, Page
import asyncio
import base64
import json
import os
import re
from dotenv import load_dotenv
from typing import List, Dict, Optional

load_dotenv()

class AgenticGeminiScraper:
    """Fully autonomous AI agent - Gemini controls everything"""

    def __init__(self, retailer_name: str, url: str):
        self.retailer_name = retailer_name
        self.url = url
        self.api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.products = []
        self.max_products = 50

    async def take_screenshot(self, page: Page) -> bytes:
        """Take a screenshot of the current page"""
        return await page.screenshot(full_page=False)

    async def ask_gemini_what_to_do(self, page: Page, task: str) -> Dict:
        """Ask Gemini to analyze page and decide next action"""
        screenshot = await self.take_screenshot(page)
        screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')

        prompt = f"""You are a web scraping AI agent. Analyze this screenshot and decide the next action.

TASK: {task}

Respond in this EXACT JSON format:
{{
    "action": "click" / "scroll" / "extract" / "navigate" / "done",
    "reasoning": "Why you're taking this action",
    "target": "CSS selector or scroll amount or URL",
    "data": {{}} // Only if action is "extract"
}}

ACTIONS:
- "click": Click an element (provide CSS selector in target)
- "scroll": Scroll page (provide amount like "500" or "bottom" in target)
- "extract": Extract data from current view (provide JSON data)
- "navigate": Navigate to URL (provide URL in target)
- "done": Task is complete

Be specific with CSS selectors (e.g., "button.specs-tab", "a.product-link:first-child").
"""

        response = self.model.generate_content([
            {'mime_type': 'image/png', 'data': screenshot_b64},
            prompt
        ])

        text = response.text.strip()
        text = re.sub(r'```json\n?|\n?```', '', text).strip()

        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group(0))
        else:
            return {"action": "done", "reasoning": "Could not parse response"}

    async def execute_action(self, page: Page, action: Dict) -> bool:
        """Execute the action Gemini decided on"""
        action_type = action.get('action')
        target = action.get('target')

        print(f"[ACTION] {action_type.upper()}: {action.get('reasoning')}")

        try:
            if action_type == 'click':
                print(f"[CLICK] {target}")
                await page.click(target, timeout=5000)
                await page.wait_for_timeout(2000)
                return True

            elif action_type == 'scroll':
                if target == 'bottom':
                    print(f"[SCROLL] To bottom")
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                else:
                    print(f"[SCROLL] {target}px")
                    await page.evaluate(f'window.scrollBy(0, {target})')
                await page.wait_for_timeout(1000)
                return True

            elif action_type == 'navigate':
                print(f"[NAVIGATE] {target}")
                await page.goto(target, wait_until='domcontentloaded', timeout=30000)
                await page.wait_for_timeout(2000)
                return True

            elif action_type == 'extract':
                print(f"[EXTRACT] Data extracted")
                return True

            elif action_type == 'done':
                print(f"[DONE] Task complete")
                return False

        except Exception as e:
            print(f"[ERROR] Action failed: {e}")
            return True  # Continue anyway

        return True

    async def scrape_product_links_agentic(self, page: Page) -> List[str]:
        """Let Gemini find and extract product links"""
        print("[AGENTIC] Gemini finding product links...")

        # Give Gemini up to 5 actions to find links
        for i in range(5):
            action = await self.ask_gemini_what_to_do(
                page,
                f"Find all phone product links on this page. Extract them as a list. Action {i+1}/5."
            )

            if action.get('action') == 'extract':
                links = action.get('data', {}).get('links', [])
                if links:
                    print(f"[FOUND] {len(links)} links")
                    return links

            should_continue = await self.execute_action(page, action)
            if not should_continue:
                break

        # Fallback to DOM extraction
        print("[FALLBACK] Using DOM to extract links...")
        links = await page.evaluate('''() => {
            const productLinks = [];
            const anchors = document.querySelectorAll('a[href*="/product/"]');
            anchors.forEach(a => {
                const href = a.href;
                if (href && href.includes('/product/') && href.endsWith('.html')) {
                    if (!productLinks.includes(href)) {
                        productLinks.push(href);
                    }
                }
            });
            return productLinks;
        }''')

        print(f"[FOUND] {len(links)} links via fallback")
        return links

    async def scrape_product_details_agentic(self, page: Page, product_url: str, index: int, total: int) -> Optional[Dict]:
        """Let Gemini navigate product page and extract all specs"""
        print(f"\n[{index}/{total}] Agentic scraping...")
        print(f"[URL] {product_url}")

        try:
            # Navigate to product page
            await page.goto(product_url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)

            # Let Gemini explore and extract - up to 10 actions
            product_data = None

            for i in range(10):
                action = await self.ask_gemini_what_to_do(
                    page,
                    f"""Extract COMPLETE phone specifications from this product page.

Include: name, brand, model, variant, pricing (cash/credit/discount), specs (display, processor, RAM, storage, camera, battery, connectivity, software, physical), images.

Action {i+1}/10. If you have all the data, use action "extract" with complete JSON."""
                )

                if action.get('action') == 'extract':
                    product_data = action.get('data', {})
                    if product_data and product_data.get('name'):
                        print(f"[SUCCESS] {product_data.get('name')}")
                        print(f"[PRICE] Rs {product_data.get('pricing', {}).get('cash_price', 'N/A')}")
                        return product_data

                should_continue = await self.execute_action(page, action)
                if not should_continue:
                    break

            # If Gemini didn't extract after 10 actions, force extraction
            if not product_data:
                print("[FALLBACK] Forcing final extraction...")
                screenshot = await self.take_screenshot(page)
                screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')
                html = await page.content()

                prompt = f"""Extract ALL phone specs from this page in JSON format:
{{
    "name": "...", "brand": "...", "model": "...", "variant": "...",
    "pricing": {{"cash_price": 0, "credit_price": 0, "discount_amount": 0, "in_stock": true}},
    "specifications": {{"display": {{}}, "processor": {{}}, "memory": {{}}, "camera": {{}}, "battery": {{}}, "connectivity": {{}}, "software": {{}}, "physical": {{}}}},
    "images": [], "url": "{product_url}", "retailer": "{self.retailer_name}"
}}

HTML: {html[:2000]}"""

                response = self.model.generate_content([
                    {'mime_type': 'image/png', 'data': screenshot_b64},
                    prompt
                ])

                text = response.text.strip()
                text = re.sub(r'```json\n?|\n?```', '', text).strip()
                json_match = re.search(r'\{[\s\S]*\}', text)

                if json_match:
                    product_data = json.loads(json_match.group(0))
                    print(f"[SUCCESS] {product_data.get('name')}")
                    return product_data

            return None

        except Exception as e:
            print(f"[ERROR] {e}")
            return None

    async def scrape(self) -> List[Dict]:
        """Main agentic scraping - Gemini in full control"""
        print(f"\n[START] Agentic Gemini Scraper for {self.retailer_name}")
        print(f"[URL] {self.url}")
        print("[MODE] Full AI autonomy - Gemini controls browser\n")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

            # Step 1: Navigate and find product links
            print("[STEP 1] Loading listing page...")
            await page.goto(self.url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)

            product_links = await self.scrape_product_links_agentic(page)

            if not product_links:
                print("[ERROR] No product links found!")
                await browser.close()
                return []

            # Limit for testing
            product_links = product_links[:self.max_products]
            print(f"\n[STEP 2] Scraping {len(product_links)} products with agentic AI...\n")

            # Step 2: Let Gemini scrape each product
            for i, link in enumerate(product_links, 1):
                product_data = await self.scrape_product_details_agentic(page, link, i, len(product_links))

                if product_data:
                    self.products.append(product_data)

                await page.wait_for_timeout(2000)

            await browser.close()

        print(f"\n[COMPLETE] Agentic scraping complete: {len(self.products)} products!\n")
        return self.products


# Test function
async def test_agentic_scraper():
    """Test fully agentic scraper"""
    scraper = AgenticGeminiScraper(
        retailer_name='Courts Mauritius',
        url='https://www.courtsmammouth.mu/category/mobile-phones.html'
    )

    # Limit to 2 products for testing (agentic is slower)
    scraper.max_products = 2

    products = await scraper.scrape()

    print("\n" + "="*80)
    print("AGENTIC GEMINI SCRAPING RESULTS")
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
    print(f"Total products: {len(products)}")
    print("="*80)

    # Save results
    with open('agentic_scrape_results.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print("\n[SAVED] Results saved to agentic_scrape_results.json")


if __name__ == '__main__':
    asyncio.run(test_agentic_scraper())
