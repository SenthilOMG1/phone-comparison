"""
361 Degrees Mauritius Scraper
Scrapes phone prices from 361.mu
"""

from playwright.async_api import Page
from typing import List, Dict
import asyncio
from .base_scraper import BaseScraper


class ThreeSixOneScraper(BaseScraper):
    """Scraper for 361 Degrees Mauritius website"""

    def __init__(self):
        super().__init__(
            retailer_name='361 Degrees',
            base_url='https://www.361.mu'
        )

    async def extract_products(self, page: Page) -> List[Dict]:
        """
        Extract phone products from 361 Degrees

        Returns:
            List of product dictionaries with name, price, stock, and URL
        """
        products = []

        try:
            # Navigate to smartphones category
            # Note: Adjust URL based on actual site structure
            smartphones_url = f"{self.base_url}/smartphones"

            # Try common URLs for phone categories
            possible_urls = [
                f"{self.base_url}/smartphones",
                f"{self.base_url}/mobile-phones",
                f"{self.base_url}/phones",
                f"{self.base_url}/category/smartphones",
                f"{self.base_url}/shop/smartphones",
            ]

            page_loaded = False
            for url in possible_urls:
                try:
                    await page.goto(url, wait_until='domcontentloaded', timeout=15000)
                    # Check if page loaded successfully (not 404)
                    if '404' not in await page.title():
                        print(f"Successfully loaded: {url}")
                        page_loaded = True
                        break
                except Exception as e:
                    print(f"Failed to load {url}: {str(e)}")
                    continue

            if not page_loaded:
                print("Could not find smartphones page on 361.mu")
                return products

            # Wait for products to load
            await self.wait_for_content(page)
            await asyncio.sleep(3)

            # Try multiple possible selectors for 361
            product_selectors = [
                '.product',
                '.product-item',
                '.product-card',
                'article.product',
                '.woocommerce-product',
                '.type-product',
                '[data-product]',
            ]

            products_found = []
            for selector in product_selectors:
                try:
                    products_found = await page.query_selector_all(selector)
                    if products_found:
                        print(f"Found {len(products_found)} products with selector: {selector}")
                        break
                except Exception as e:
                    continue

            if not products_found:
                print(f"No products found. Page title: {await page.title()}")
                return products

            # Extract product details
            for product_elem in products_found[:50]:  # Limit to 50 products
                try:
                    product_data = await self._extract_product_details(product_elem)

                    if product_data and self.is_phone_product(product_data.get('name', '')):
                        products.append(product_data)

                except Exception as e:
                    print(f"Error extracting product: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error navigating 361 Degrees: {str(e)}")
            raise

        return products

    async def _extract_product_details(self, element) -> Dict:
        """Extract details from a single product element"""

        # Try multiple selectors for product name
        name_selectors = [
            'h2.woocommerce-loop-product__title',
            '.product-title',
            '.product-name',
            'h2',
            'h3',
            '.title',
            'a.product-link',
        ]

        name = None
        for selector in name_selectors:
            try:
                name_elem = await element.query_selector(selector)
                if name_elem:
                    name = await name_elem.inner_text()
                    if name:
                        break
            except:
                continue

        if not name:
            return None

        name = self.clean_text(name)

        # Try multiple selectors for price
        price_selectors = [
            '.price',
            '.woocommerce-Price-amount',
            '.product-price',
            '[data-price]',
            '.amount',
        ]

        price_text = None
        for selector in price_selectors:
            try:
                price_elem = await element.query_selector(selector)
                if price_elem:
                    price_text = await price_elem.inner_text()
                    if price_text:
                        break
            except:
                continue

        if not price_text:
            return None

        price_cash = self.extract_price(price_text)
        if not price_cash:
            return None

        # Try to get product URL
        url = None
        try:
            link_elem = await element.query_selector('a')
            if link_elem:
                href = await link_elem.get_attribute('href')
                if href:
                    url = href if href.startswith('http') else f"{self.base_url}{href}"
        except:
            pass

        # Check stock status
        in_stock = True
        try:
            # Check for out of stock indicators
            out_of_stock_selectors = [
                '.out-of-stock',
                '.outofstock',
                '.stock-out',
                '.unavailable'
            ]

            for selector in out_of_stock_selectors:
                stock_elem = await element.query_selector(selector)
                if stock_elem:
                    in_stock = False
                    break

            # Also check for explicit in-stock indicator
            in_stock_elem = await element.query_selector('.in-stock, .instock')
            if in_stock_elem:
                in_stock = True

        except:
            pass

        return {
            'name': name,
            'price_cash': price_cash,
            'in_stock': in_stock,
            'url': url
        }


if __name__ == '__main__':
    """Test the 361 Degrees scraper"""
    import asyncio

    async def test():
        scraper = ThreeSixOneScraper()
        result = await scraper.scrape()

        print(f"\nStatus: {result['status']}")
        print(f"Products found: {result['products_found']}")
        print(f"Execution time: {result['execution_time_ms']}ms")

        if result['errors']:
            print(f"Errors: {result['errors']}")

        if result['products']:
            print("\nSample products:")
            for product in result['products'][:5]:
                print(f"  - {product['name']}: MUR {product['price_cash']}")

    asyncio.run(test())
