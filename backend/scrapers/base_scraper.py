from abc import ABC, abstractmethod
from playwright.async_api import async_playwright, Page, Browser
from fake_useragent import UserAgent
import asyncio
import time
import re
from typing import List, Dict, Optional
from datetime import datetime

class BaseScraper(ABC):
    """Base class for all website scrapers"""

    def __init__(self, retailer_name: str, base_url: str):
        self.retailer_name = retailer_name
        self.base_url = base_url
        self.ua = UserAgent()
        self.products = []
        self.errors = []

    async def scrape(self) -> Dict:
        """Main scraping workflow"""
        start_time = time.time()

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=False,  # Show browser window
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox'
                    ]
                )

                context = await browser.new_context(
                    user_agent=self.ua.random,
                    viewport={'width': 1920, 'height': 1080},
                    ignore_https_errors=True
                )

                # Set extra headers to avoid detection
                await context.set_extra_http_headers({
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                })

                page = await context.new_page()

                # Extract products
                self.products = await self.extract_products(page)

                await browser.close()

            execution_time = int((time.time() - start_time) * 1000)

            return {
                'status': 'success' if self.products else 'partial',
                'products_found': len(self.products),
                'products': self.products,
                'errors': self.errors,
                'execution_time_ms': execution_time,
                'scraped_at': datetime.utcnow().isoformat()
            }

        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            self.errors.append(f"Fatal error: {str(e)}")

            return {
                'status': 'failed',
                'products_found': 0,
                'products': [],
                'errors': self.errors,
                'execution_time_ms': execution_time,
                'scraped_at': datetime.utcnow().isoformat()
            }

    @abstractmethod
    async def extract_products(self, page: Page) -> List[Dict]:
        """Extract products from page - must be implemented by each scraper"""
        pass

    async def wait_for_content(self, page: Page, timeout: int = 15000):
        """Wait for dynamic content to load"""
        try:
            await page.wait_for_load_state('networkidle', timeout=timeout)
        except:
            # Fallback to domcontentloaded
            try:
                await page.wait_for_load_state('domcontentloaded', timeout=5000)
            except:
                # Last resort - just wait a bit
                await page.wait_for_timeout(3000)

    async def scroll_page(self, page: Page, scrolls: int = 3):
        """Scroll page to load lazy content"""
        for i in range(scrolls):
            await page.evaluate(f'window.scrollTo(0, document.body.scrollHeight * {(i+1)/scrolls})')
            await page.wait_for_timeout(500)

    def extract_price(self, price_text: str) -> Optional[float]:
        """Extract numeric price from text like 'Rs 35,000' or 'MUR 35000'"""
        if not price_text:
            return None

        # Remove currency symbols, spaces, and extract numbers
        cleaned = price_text.replace(',', '').replace(' ', '')
        numbers = re.findall(r'\d+\.?\d*', cleaned)

        if numbers:
            try:
                return float(numbers[0])
            except:
                return None
        return None

    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        return ' '.join(text.strip().split())

    def is_phone_product(self, name: str) -> bool:
        """Check if product name seems to be a phone"""
        if not name:
            return False

        name_lower = name.lower()

        # Exclude obvious non-phones
        exclude_keywords = ['case', 'cover', 'charger', 'cable', 'screen protector',
                           'headphone', 'earphone', 'power bank', 'adapter', 'tempered glass',
                           'holder', 'stand', 'warranty', 'insurance']

        if any(keyword in name_lower for keyword in exclude_keywords):
            return False

        # Include obvious phones
        phone_brands = ['samsung', 'apple', 'iphone', 'xiaomi', 'redmi', 'oppo', 'vivo',
                       'realme', 'honor', 'oneplus', 'google', 'pixel', 'huawei',
                       'motorola', 'nokia', 'galaxy']

        if any(brand in name_lower for brand in phone_brands):
            return True

        # Check for phone-like patterns
        phone_patterns = [r'\d+gb', r'pro max', r'ultra', r'\d+\s*mp', r'\d+\s*inch']
        if any(re.search(pattern, name_lower) for pattern in phone_patterns):
            return True

        return False
