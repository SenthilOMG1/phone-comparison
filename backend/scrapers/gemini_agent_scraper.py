"""
Gemini-powered autonomous web scraper
Uses Gemini 2.0 Flash with vision to navigate websites and extract data
"""

import google.generativeai as genai
from playwright.async_api import async_playwright, Page
import asyncio
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

class GeminiAgentScraper:
    """AI-powered scraper that uses Gemini to navigate and extract data"""

    def __init__(self, url: str, task: str):
        self.url = url
        self.task = task
        self.api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.api_key)
        # Use Gemini 2.5 Flash - stable, fast, excellent vision support
        # Has higher quota limits than gemini-3-pro-preview
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.products = []
        self.max_iterations = 20  # Prevent infinite loops

    async def take_screenshot(self, page: Page) -> bytes:
        """Take a screenshot of the current page"""
        return await page.screenshot(full_page=False)  # Viewport only for speed

    async def execute_action(self, page: Page, action: dict):
        """Execute a browser action based on Gemini's decision"""
        action_type = action.get('type')

        if action_type == 'scroll_down':
            await page.evaluate('window.scrollBy(0, window.innerHeight)')
            await page.wait_for_timeout(1000)

        elif action_type == 'scroll_to_top':
            await page.evaluate('window.scrollTo(0, 0)')
            await page.wait_for_timeout(500)

        elif action_type == 'click':
            selector = action.get('selector')
            try:
                await page.click(selector, timeout=5000)
                await page.wait_for_timeout(2000)
            except:
                print(f"[WARN] Could not click: {selector}")

        elif action_type == 'wait':
            duration = action.get('duration', 2000)
            await page.wait_for_timeout(duration)

        elif action_type == 'goto_url':
            new_url = action.get('url')
            await page.goto(new_url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(2000)

    async def ask_gemini(self, screenshot: bytes, html: str, iteration: int) -> dict:
        """Ask Gemini what to do next based on screenshot and HTML"""

        # Encode screenshot to base64
        screenshot_b64 = base64.b64encode(screenshot).decode('utf-8')

        prompt = f"""You are an expert AI web scraping agent specialized in extracting phone products from Mauritius e-commerce sites.

TASK: {self.task}
PROGRESS: Iteration {iteration}/{self.max_iterations}
PRODUCTS FOUND: {len(self.products)}

ANALYZE the screenshot and HTML to decide your next action.

AVAILABLE ACTIONS:
1. **extract_products** - Extract all visible phone products NOW (use this first if you see products)
2. **scroll_down** - Scroll down to load more products
3. **click** - Click pagination/filter/load-more buttons (provide exact CSS selector)
4. **wait** - Wait for lazy-loaded content (2-3 seconds)
5. **done** - No more products visible, task complete

HTML CONTEXT (first 2000 chars):
{html[:2000]}

RESPONSE FORMAT (valid JSON only):
{{
    "reasoning": "Brief explanation of what you see and why you're taking this action",
    "action": {{
        "type": "extract_products|scroll_down|click|wait|done",
        "selector": "CSS selector (only if type=click)",
        "products": [
            {{
                "name": "Full product name (e.g., Samsung Galaxy S24 Ultra 512GB Black)",
                "price": 45990,
                "price_text": "Rs 45,990",
                "url": "Full product URL",
                "in_stock": true,
                "image_url": "Product image URL if visible"
            }}
        ] (only if type=extract_products)
    }}
}}

CRITICAL RULES:
- If you see ANY phone products → use "extract_products" FIRST
- Extract EVERY visible product in the current view
- Prices in Mauritian Rupees (Rs) - convert "Rs 45,990" to integer 45990
- Include full product URLs (check href attributes)
- After extraction, scroll_down to see more OR done if at end
- If you see "Load More" / "Next Page" buttons, click them
- If scrolled 3+ times without new products → done
- Be thorough but efficient
"""

        # Send screenshot + prompt to Gemini
        response = self.model.generate_content([
            {
                'mime_type': 'image/png',
                'data': screenshot_b64
            },
            prompt
        ])

        # Parse JSON response
        text = response.text.strip()

        # Remove markdown code blocks and extract JSON
        import re
        text = re.sub(r'```json\n?|\n?```', '', text).strip()

        # Try to find JSON object in the response
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            json_text = json_match.group(0)
        else:
            json_text = text

        try:
            decision = json.loads(json_text)
            return decision
        except json.JSONDecodeError:
            print(f"[WARN] Invalid JSON from Gemini: {text[:200]}")
            return {"action": {"type": "done"}}

    async def scrape(self) -> list:
        """Main scraping loop controlled by Gemini"""
        print(f"\n[AI] Starting Gemini Agent Scraper")
        print(f"[URL] {self.url}")
        print(f"[TASK] {self.task}\n")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

            # Navigate to URL
            print("[WEB] Loading page...")
            await page.goto(self.url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)  # Let page settle

            # Agent loop
            for iteration in range(1, self.max_iterations + 1):
                print(f"\n--- Iteration {iteration} ---")

                # Take screenshot
                screenshot = await self.take_screenshot(page)

                # Get HTML
                html = await page.content()

                # Ask Gemini what to do
                print("[AI] Asking Gemini...")
                decision = await self.ask_gemini(screenshot, html, iteration)

                print(f"[REASON] {decision.get('reasoning', 'N/A')}")

                action = decision.get('action', {})
                action_type = action.get('type')

                print(f"[ACTION] {action_type}")

                # Handle product extraction
                if action_type == 'extract_products':
                    products = action.get('products', [])
                    print(f"[EXTRACT] Found {len(products)} products")
                    self.products.extend(products)

                    # Continue to next action (usually scroll or done)
                    if 'next_action' in action:
                        await self.execute_action(page, action['next_action'])
                    else:
                        # Default: scroll down to see more
                        await self.execute_action(page, {'type': 'scroll_down'})

                elif action_type == 'done':
                    print("[DONE] Gemini says task is complete!")
                    break

                else:
                    # Execute the action
                    await self.execute_action(page, action)

            await browser.close()

        print(f"\n[COMPLETE] Scraping complete! Found {len(self.products)} products\n")
        return self.products


# Test function
async def test_gemini_scraper():
    """Test the Gemini agent scraper on Courts"""
    scraper = GeminiAgentScraper(
        url='https://www.courtsmammouth.mu/category/mobile-phones.html',
        task='Extract all phone products with their names, prices, and URLs from Courts Mauritius'
    )

    products = await scraper.scrape()

    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    for i, product in enumerate(products[:10], 1):  # Show first 10
        print(f"{i}. {product.get('name')} - Rs {product.get('price')}")
    print(f"\nTotal: {len(products)} products")


if __name__ == '__main__':
    asyncio.run(test_gemini_scraper())
