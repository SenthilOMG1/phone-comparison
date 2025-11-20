from .base_scraper import BaseScraper
from playwright.async_api import Page
from typing import List, Dict

class GalaxyScraper(BaseScraper):
    """Scraper for Galaxy.mu (Magento-based e-commerce)"""

    def __init__(self):
        super().__init__(
            retailer_name='Galaxy',
            base_url='https://www.galaxy.mu'
        )

    async def extract_products(self, page: Page) -> List[Dict]:
        products = []

        try:
            # Navigate to smartphones category
            # Adjust URL based on actual Galaxy website structure
            phones_url = f"{self.base_url}/smartphones.html"

            print(f"Navigating to: {phones_url}")
            await page.goto(phones_url, wait_until='domcontentloaded', timeout=30000)
            await self.wait_for_content(page)

            # Scroll to load lazy products (common in Magento)
            await self.scroll_page(page, scrolls=4)

            # Magento typically uses .product-item class
            possible_selectors = [
                '.product-item',
                '.product-item-info',
                '.item.product',
                '[class*="product"]',
                '.products-grid .item'
            ]

            product_selector = None
            for selector in possible_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    product_selector = selector
                    print(f"Found products with selector: {selector}")
                    break
                except:
                    continue

            if not product_selector:
                self.errors.append("Could not find product container selector")
                return products

            # Extract product elements
            product_elements = await page.query_selector_all(product_selector)
            print(f"Found {len(product_elements)} product elements")

            for element in product_elements:
                try:
                    product = await self._extract_single_product(element)
                    if product and self.is_phone_product(product['name']):
                        products.append(product)
                except Exception as e:
                    self.errors.append(f"Error extracting product: {str(e)}")
                    continue

        except Exception as e:
            self.errors.append(f"Page load error: {str(e)}")

        print(f"Successfully extracted {len(products)} phone products")
        return products

    async def _extract_single_product(self, element) -> Dict:
        """Extract data from a single product card"""

        # Product name
        name = None
        name_selectors = [
            '.product-item-name',
            '.product-name',
            'a.product-item-link',
            'h2 a',
            'h3 a',
            '.product-item-details a'
        ]

        for selector in name_selectors:
            try:
                name_elem = await element.query_selector(selector)
                if name_elem:
                    name = await name_elem.inner_text()
                    if name and len(name.strip()) > 3:
                        break
            except:
                continue

        if not name:
            return None

        # Price (current/special price)
        price_cash = None
        price_selectors = [
            '.special-price .price',
            '.price',
            '[class*="special-price"]',
            '.price-box .price',
            '.product-price .price'
        ]

        for selector in price_selectors:
            try:
                price_elem = await element.query_selector(selector)
                if price_elem:
                    price_text = await price_elem.inner_text()
                    price_cash = self.extract_price(price_text)
                    if price_cash and price_cash > 1000:
                        break
            except:
                continue

        # Original price (regular/old price)
        original_price = None
        original_selectors = [
            '.old-price .price',
            '.regular-price .price',
            '[class*="old-price"]',
            '[class*="was"]'
        ]

        for selector in original_selectors:
            try:
                original_elem = await element.query_selector(selector)
                if original_elem:
                    original_text = await original_elem.inner_text()
                    original_price = self.extract_price(original_text)
                    if original_price:
                        break
            except:
                continue

        # URL
        url = None
        try:
            link_elem = await element.query_selector('a.product-item-link, a[href*="product"]')
            if link_elem:
                url = await link_elem.get_attribute('href')
                if url and not url.startswith('http'):
                    url = f"{self.base_url}{url if url.startswith('/') else '/' + url}"
        except:
            pass

        # Stock status
        # Magento often hides out-of-stock items or shows badge
        in_stock = True
        stock_status = 'in_stock'

        stock_selectors = [
            '.stock.unavailable',
            '.out-of-stock',
            '[class*="unavailable"]',
            '[class*="out-of-stock"]'
        ]

        for selector in stock_selectors:
            try:
                stock_elem = await element.query_selector(selector)
                if stock_elem:
                    in_stock = False
                    stock_status = 'out_of_stock'
                    break
            except:
                continue

        # Promo/Sale badge
        promo_text = None
        promo_selectors = [
            '.product-label',
            '.sale-badge',
            '[class*="badge"]',
            '[class*="label"]',
            '.special-tag'
        ]

        for selector in promo_selectors:
            try:
                promo_elem = await element.query_selector(selector)
                if promo_elem:
                    promo_text = await promo_elem.inner_text()
                    promo_text = self.clean_text(promo_text)
                    # Skip generic labels
                    if promo_text and promo_text.lower() not in ['new', 'hot', 'sale']:
                        break
                    else:
                        promo_text = None
            except:
                continue

        # Galaxy often shows "Save Rs X" - try to extract that
        if not promo_text and original_price and price_cash:
            savings = original_price - price_cash
            if savings > 0:
                promo_text = f"Save Rs {int(savings)}"

        return {
            'name': self.clean_text(name),
            'price_cash': price_cash,
            'price_credit': None,
            'original_price': original_price,
            'url': url,
            'in_stock': in_stock,
            'stock_status': stock_status,
            'promo_text': promo_text
        }
