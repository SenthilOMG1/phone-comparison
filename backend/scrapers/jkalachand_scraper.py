"""
JKalachand Mauritius Scraper
Scrapes phone prices from jkalachand.com
"""

from playwright.async_api import Page
from typing import List, Dict
import asyncio
from .base_scraper import BaseScraper


class JKalachandScraper(BaseScraper):
    """Scraper for JKalachand Mauritius website"""

    def __init__(self):
        super().__init__(
            retailer_name='JKalachand',
            base_url='https://www.jkalachand.com'
        )

    async def extract_products(self, page: Page) -> List[Dict]:
        """
        Extract phone products from JKalachand

        Returns:
            List of product dictionaries with name, price, stock, and URL
        """
        products = []

        try:
            # Navigate to mobile phones category
            # JKalachand likely has phones under electronics/mobiles or similar
            phones_url = f"{self.base_url}/mobile-phones"

            print(f"Navigating to: {phones_url}")
            await page.goto(phones_url, wait_until='domcontentloaded', timeout=30000)
            await self.wait_for_content(page)

            # Scroll to load lazy-loaded products
            await self.scroll_page(page, scrolls=5)

            # Try multiple possible selectors
            possible_selectors = [
                '.product-item',
                '.product',
                '.item',
                '[data-product-id]',
                '.product-card',
                '.phone-item',
                'article.product'
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
                product_elements = await page.query_selector_all('.grid > div, .products > div, [class*="product"]')

            # Extract product information
            for element in product_elements:
                try:
                    # Extract product name
                    name_selectors = [
                        '.product-name',
                        '.product-title',
                        'h2',
                        'h3',
                        '.title',
                        '[class*="name"]',
                        'a[title]'
                    ]

                    name = None
                    for sel in name_selectors:
                        try:
                            name_elem = await element.query_selector(sel)
                            if name_elem:
                                # Try text content first
                                name = await name_elem.text_content()
                                if not name or not name.strip():
                                    # Fallback to title attribute
                                    name = await name_elem.get_attribute('title')
                                name = self.clean_text(name) if name else None
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
                        '[data-price]',
                        '.regular-price'
                    ]

                    price = None
                    original_price = None

                    for sel in price_selectors:
                        try:
                            price_elem = await element.query_selector(sel)
                            if price_elem:
                                price_text = await price_elem.text_content()
                                extracted_price = self.extract_price(price_text)
                                if extracted_price:
                                    price = extracted_price
                                    break
                        except:
                            continue

                    # Check for original price (discounts)
                    try:
                        sale_selectors = ['.old-price', '.was-price', '.original-price', '[class*="old"]']
                        for sel in sale_selectors:
                            original_price_elem = await element.query_selector(sel)
                            if original_price_elem:
                                original_text = await original_price_elem.text_content()
                                original_price = self.extract_price(original_text)
                                if original_price:
                                    break
                    except:
                        pass

                    # Extract product URL
                    url = None
                    try:
                        link_elem = await element.query_selector('a')
                        if link_elem:
                            url = await link_elem.get_attribute('href')
                            if url and not url.startswith('http'):
                                url = f"{self.base_url}{url}" if url.startswith('/') else f"{self.base_url}/{url}"
                    except:
                        pass

                    # Check stock availability
                    in_stock = True
                    try:
                        element_text = await element.text_content()
                        stock_indicators = ['out of stock', 'sold out', 'unavailable', 'not available', 'coming soon']
                        if any(term in element_text.lower() for term in stock_indicators):
                            in_stock = False

                        # Also check for stock badge/label
                        stock_elem = await element.query_selector('.stock-status, [class*="stock"]')
                        if stock_elem:
                            stock_text = await stock_elem.text_content()
                            if any(term in stock_text.lower() for term in stock_indicators):
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
            print(f"Error scraping JKalachand: {e}")
            raise

        return products
