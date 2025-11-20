"""
Emtel Mauritius Scraper
Scrapes phone prices from emtel.com
"""

from playwright.async_api import Page
from typing import List, Dict
import asyncio
from .base_scraper import BaseScraper


class EmtelScraper(BaseScraper):
    """Scraper for Emtel Mauritius website"""

    def __init__(self):
        super().__init__(
            retailer_name='Emtel',
            base_url='https://www.emtel.com'
        )

    async def extract_products(self, page: Page) -> List[Dict]:
        """
        Extract phone products from Emtel

        Returns:
            List of product dictionaries with name, price, stock, and URL
        """
        products = []

        try:
            # Navigate to smartphones/devices section
            # Emtel typically has phones under shop/devices or similar
            phones_url = f"{self.base_url}/shop/devices/smartphones"

            print(f"Navigating to: {phones_url}")
            await page.goto(phones_url, wait_until='domcontentloaded', timeout=30000)
            await self.wait_for_content(page)

            # Scroll to load lazy-loaded products
            await self.scroll_page(page, scrolls=4)

            # Try multiple possible selectors for Emtel's structure
            possible_selectors = [
                '.product-item',
                '.device-card',
                '.phone-item',
                '[data-product]',
                '.item-product',
                '.product-card'
            ]

            product_elements = None
            for selector in possible_selectors:
                try:
                    product_elements = await page.query_selector_all(selector)
                    if product_elements and len(product_elements) > 0:
                        print(f"Found {len(product_elements)} products using selector: {selector}")
                        break
                except:
                    continue

            if not product_elements:
                print("Warning: No product elements found. Trying fallback...")
                # Fallback: try to find any elements that might be products
                product_elements = await page.query_selector_all('article, .card, [class*="product"]')

            # Extract product information
            for element in product_elements:
                try:
                    # Extract product name
                    name_selectors = [
                        '.product-name',
                        '.device-name',
                        'h2',
                        'h3',
                        '.title',
                        '[class*="name"]'
                    ]

                    name = None
                    for sel in name_selectors:
                        try:
                            name_elem = await element.query_selector(sel)
                            if name_elem:
                                name = await name_elem.text_content()
                                name = self.clean_text(name)
                                if name and self.is_phone_product(name):
                                    break
                        except:
                            continue

                    if not name or not self.is_phone_product(name):
                        continue

                    # Extract price
                    price_selectors = [
                        '.price',
                        '.product-price',
                        '[class*="price"]',
                        '.amount',
                        '[data-price]'
                    ]

                    price = None
                    original_price = None

                    for sel in price_selectors:
                        try:
                            price_elem = await element.query_selector(sel)
                            if price_elem:
                                price_text = await price_elem.text_content()
                                price = self.extract_price(price_text)
                                if price:
                                    break
                        except:
                            continue

                    # Check for original price (if on sale)
                    try:
                        original_price_elem = await element.query_selector('.original-price, .old-price, .was-price')
                        if original_price_elem:
                            original_text = await original_price_elem.text_content()
                            original_price = self.extract_price(original_text)
                    except:
                        pass

                    # Extract product URL
                    url = None
                    try:
                        link_elem = await element.query_selector('a')
                        if link_elem:
                            url = await link_elem.get_attribute('href')
                            if url and not url.startswith('http'):
                                url = f"{self.base_url}{url}"
                    except:
                        pass

                    # Check stock availability
                    in_stock = True
                    try:
                        out_of_stock_text = await element.text_content()
                        if any(term in out_of_stock_text.lower() for term in ['out of stock', 'sold out', 'unavailable']):
                            in_stock = False
                    except:
                        pass

                    if name and price:
                        product = {
                            'name': name,
                            'price_cash': price,
                            'original_price': original_price,
                            'in_stock': in_stock,
                            'url': url or phones_url
                        }
                        products.append(product)
                        print(f"  ✓ {name}: Rs {price:,.0f}")

                except Exception as e:
                    print(f"  ⚠ Error extracting product: {e}")
                    continue

        except Exception as e:
            print(f"Error scraping Emtel: {e}")
            raise

        return products
