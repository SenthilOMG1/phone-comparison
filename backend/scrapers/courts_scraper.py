from .base_scraper import BaseScraper
from playwright.async_api import Page
from typing import List, Dict
import asyncio

class CourtsScraper(BaseScraper):
    """Scraper for Courts Mammouth Mauritius"""

    def __init__(self):
        super().__init__(
            retailer_name='Courts Mauritius',
            base_url='https://www.courtsmammouth.mu'
        )

    async def extract_products(self, page: Page) -> List[Dict]:
        products = []

        # Try both URLs provided by user
        urls_to_try = [
            f"{self.base_url}/category/mobile-phones.html",
            f"{self.base_url}/11626-mobile-phones/s-86/categories_2-promo_listing"
        ]

        for base_phones_url in urls_to_try:
            try:
                # Load all products at once by setting results per page to 200
                phones_url = f"{base_phones_url}?resultsPerPage=200"
                print(f"Navigating to: {phones_url}")
                await page.goto(phones_url, wait_until='domcontentloaded', timeout=30000)
                await self.wait_for_content(page)

                # Wait for product grid to appear
                possible_selectors = [
                    '.product-miniature',
                    '.product-item',
                    '.product-card',
                    '.product',
                    '[data-product-id]',
                ]

                product_selector = None
                for selector in possible_selectors:
                    try:
                        await page.wait_for_selector(selector, timeout=5000)
                        product_selector = selector
                        print(f"  Found products with selector: {selector}")
                        break
                    except:
                        continue

                if product_selector:
                    # Extract all product elements
                    product_elements = await page.query_selector_all(product_selector)
                    print(f"  Found {len(product_elements)} products")

                    for element in product_elements:
                        try:
                            product = await self._extract_single_product(element, phones_url)
                            if product and self.is_phone_product(product['name']):
                                products.append(product)
                        except Exception as e:
                            self.errors.append(f"Error extracting product: {str(e)}")
                            continue
                else:
                    print(f"  No products found")

                # If we found products from all pages, stop trying other URLs
                if products:
                    break

            except Exception as e:
                print(f"  Error loading {phones_url}: {str(e)}")
                continue

        print(f"Successfully extracted {len(products)} phone products")
        return products

    async def _extract_single_product(self, element, base_url: str) -> Dict:
        """Extract data from a single product card"""

        # Product name (try multiple selectors)
        name = None
        name_selectors = [
            '.product-name',
            '.product-title',
            'h3',
            'h4',
            '.title',
            '[class*="name"]',
            'a.product-link',
            '.h3'
        ]

        for selector in name_selectors:
            try:
                name_elem = await element.query_selector(selector)
                if name_elem:
                    name = await name_elem.inner_text()
                    if name and len(name.strip()) > 3:
                        name = self.clean_text(name)
                        break
            except:
                continue

        if not name:
            return None

        # Price (cash)
        price_cash = None
        price_selectors = [
            '.price',
            '.price-cash',
            '.final-price',
            '[class*="price"]',
            '.product-price',
            '.sale-price',
            '[itemprop="price"]'
        ]

        for selector in price_selectors:
            try:
                price_elem = await element.query_selector(selector)
                if price_elem:
                    price_text = await price_elem.inner_text()
                    price_cash = self.extract_price(price_text)
                    if price_cash and price_cash > 1000:  # Sanity check
                        break
            except:
                continue

        # Original price (if on sale)
        original_price = None
        original_selectors = [
            '.old-price',
            '.original-price',
            '.was-price',
            '[class*="regular-price"]'
        ]

        for selector in original_selectors:
            try:
                original_elem = await element.query_selector(selector)
                if original_elem:
                    original_text = await original_elem.inner_text()
                    original_price = self.extract_price(original_text)
                    break
            except:
                continue

        # URL
        url = None
        try:
            link_elem = await element.query_selector('a')
            if link_elem:
                url = await link_elem.get_attribute('href')
                if url and not url.startswith('http'):
                    url = f"{self.base_url}{url}" if url.startswith('/') else f"{self.base_url}/{url}"
        except:
            url = base_url

        # Stock status
        in_stock = True
        try:
            element_text = await element.inner_text()
            if any(term in element_text.lower() for term in ['out of stock', 'sold out', 'unavailable']):
                in_stock = False
        except:
            pass

        return {
            'name': name,
            'price_cash': price_cash,
            'original_price': original_price,
            'in_stock': in_stock,
            'url': url
        }
