"""
Price Guru Mauritius Scraper
Scrapes phone prices from priceguru.mu
"""

from playwright.async_api import Page
from typing import List, Dict
import asyncio
from .base_scraper import BaseScraper


class PriceGuruScraper(BaseScraper):
    """Scraper for Price Guru Mauritius website"""

    def __init__(self):
        super().__init__(
            retailer_name='Price Guru',
            base_url='https://priceguru.mu'
        )

    async def extract_products(self, page: Page) -> List[Dict]:
        """
        Extract phone products from Price Guru

        Returns:
            List of product dictionaries with name, price, stock, and URL
        """
        products = []

        try:
            # Navigate to smartphones category
            await page.goto(f"{self.base_url}/c/mobile-phones-tablets/smartphones",
                          wait_until='domcontentloaded',
                          timeout=30000)

            # Wait for products to load
            await self.wait_for_content(page)

            # Additional wait for dynamic content
            await asyncio.sleep(3)

            # Try multiple possible selectors for Price Guru
            product_selectors = [
                '.product-item',
                '.product-card',
                '.item-product',
                'article.product',
                '[data-product-id]',
                '.grid-item',
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
                # Try to get page content for debugging
                content = await page.content()
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
            print(f"Error navigating Price Guru: {str(e)}")
            raise

        return products

    async def _extract_product_details(self, element) -> Dict:
        """Extract details from a single product element"""

        # Try multiple selectors for product name
        name_selectors = [
            '.product-name',
            '.product-title',
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
            '.product-price',
            '[data-price]',
            '.special-price',
            '.final-price',
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
            stock_indicators = await element.query_selector_all('.out-of-stock, .unavailable, .stock-out')
            if stock_indicators:
                in_stock = False
        except:
            pass

        return {
            'name': name,
            'price_cash': price_cash,
            'in_stock': in_stock,
            'url': url
        }


if __name__ == '__main__':
    """Test the Price Guru scraper"""
    import asyncio

    async def test():
        scraper = PriceGuruScraper()
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
