import google.generativeai as genai
from typing import Dict, Optional
import json
import re
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

class ProductNormalizer:
    """Normalize product names using Gemini API to create canonical product identifiers"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.cache = {}  # In-memory cache for normalized names

    @lru_cache(maxsize=1000)
    def normalize(self, raw_name: str) -> Dict:
        """
        Normalize a product name to canonical format
        Returns: {brand, model, variant, normalized_name, slug}
        """

        # Check cache first
        if raw_name in self.cache:
            return self.cache[raw_name]

        # Try simple regex patterns first (free, faster)
        quick_result = self._quick_normalize(raw_name)
        if quick_result:
            self.cache[raw_name] = quick_result
            return quick_result

        # Fall back to simple normalization (skip Gemini due to quota limits)
        result = self._fallback_normalize(raw_name)
        self.cache[raw_name] = result
        return result

    def _quick_normalize(self, raw_name: str) -> Optional[Dict]:
        """Fast regex-based normalization for common patterns"""

        raw_name_lower = raw_name.lower()

        # iPhone pattern
        iphone_match = re.search(r'iphone\s*(1[1-9]|[2-9]\d)\s*(pro\s*max|pro|plus|mini)?', raw_name_lower)
        if iphone_match:
            model = iphone_match.group(0).title().replace('Iphone', 'iPhone')
            storage_match = re.search(r'(\d+)\s*gb', raw_name_lower)
            color_match = re.search(r'(black|white|blue|green|red|purple|yellow|pink|silver|gold|graphite|midnight|starlight|sierra blue)', raw_name_lower)

            storage = storage_match.group(0).upper() if storage_match else ''
            color = color_match.group(0).title() if color_match else ''
            variant = f"{storage} {color}".strip()

            normalized_name = f"Apple {model}"
            if variant:
                normalized_name += f" {variant}"

            return {
                'brand': 'Apple',
                'model': model,
                'variant': variant,
                'normalized_name': normalized_name.strip(),
                'slug': self._generate_slug(normalized_name)
            }

        # Samsung Galaxy pattern
        galaxy_match = re.search(r'galaxy\s*([sa]\d+\s*(?:ultra|plus|fe)?)', raw_name_lower)
        if galaxy_match:
            model = f"Galaxy {galaxy_match.group(1).title()}"
            storage_match = re.search(r'(\d+)\s*gb', raw_name_lower)
            color_match = re.search(r'(black|white|blue|green|red|purple|yellow|pink|silver|gold|phantom|cream)', raw_name_lower)

            storage = storage_match.group(0).upper() if storage_match else ''
            color = color_match.group(0).title() if color_match else ''
            variant = f"{storage} {color}".strip()

            normalized_name = f"Samsung {model}"
            if variant:
                normalized_name += f" {variant}"

            return {
                'brand': 'Samsung',
                'model': model,
                'variant': variant,
                'normalized_name': normalized_name.strip(),
                'slug': self._generate_slug(normalized_name)
            }

        # Xiaomi pattern
        xiaomi_match = re.search(r'(xiaomi|redmi)\s*(\d+[a-z]?\s*(?:pro|ultra|plus|note|lite)?)', raw_name_lower)
        if xiaomi_match:
            brand = xiaomi_match.group(1).title()
            model = xiaomi_match.group(2).title()
            storage_match = re.search(r'(\d+)\s*gb', raw_name_lower)

            storage = storage_match.group(0).upper() if storage_match else ''
            normalized_name = f"{brand} {model}"
            if storage:
                normalized_name += f" {storage}"

            return {
                'brand': brand,
                'model': model,
                'variant': storage,
                'normalized_name': normalized_name.strip(),
                'slug': self._generate_slug(normalized_name)
            }

        # Honor pattern
        honor_match = re.search(r'honor\s*([x\d]+[a-z]?\s*(?:pro|lite|plus)?)', raw_name_lower)
        if honor_match:
            model = f"Honor {honor_match.group(1).title()}"
            storage_match = re.search(r'(\d+)\s*gb', raw_name_lower)

            storage = storage_match.group(0).upper() if storage_match else ''
            normalized_name = model
            if storage:
                normalized_name += f" {storage}"

            return {
                'brand': 'Honor',
                'model': model,
                'variant': storage,
                'normalized_name': normalized_name.strip(),
                'slug': self._generate_slug(normalized_name)
            }

        return None

    def _gemini_normalize(self, raw_name: str) -> Dict:
        """Use Gemini API to normalize complex product names"""

        prompt = f"""
Normalize this phone product name to a canonical format.
Input: "{raw_name}"

Return ONLY valid JSON with this exact structure (no extra text):
{{
    "brand": "Samsung",
    "model": "Galaxy S24",
    "variant": "256GB Black",
    "normalized_name": "Samsung Galaxy S24 256GB Black"
}}

Rules:
- Brand must be one of: Samsung, Apple, Xiaomi, Oppo, Vivo, Realme, Honor, OnePlus, Google, Huawei, Motorola, Nokia, Infinix, Tecno
- Model is the core model name (e.g., "Galaxy S24", "iPhone 15 Pro", "Redmi Note 13")
- Variant includes storage (GB), RAM (if mentioned), color
- normalized_name is the full canonical name in proper case
- If input is not a phone, return: {{"error": "not_a_phone"}}

Examples:
"SAMSUNG GALAXY S24 ULTRA 512GB TITANIUM GRAY" → {{"brand": "Samsung", "model": "Galaxy S24 Ultra", "variant": "512GB Titanium Gray", "normalized_name": "Samsung Galaxy S24 Ultra 512GB Titanium Gray"}}
"Apple iPhone 15 Pro Max - 256 Go - Titane Naturel" → {{"brand": "Apple", "model": "iPhone 15 Pro Max", "variant": "256GB Natural Titanium", "normalized_name": "Apple iPhone 15 Pro Max 256GB Natural Titanium"}}
        """

        response = self.model.generate_content(prompt)
        text = response.text.strip()

        # Remove markdown code blocks if present
        text = re.sub(r'```json\n?|\n?```', '', text).strip()

        result = json.loads(text)

        if 'error' in result:
            raise Exception(result['error'])

        # Add slug
        result['slug'] = self._generate_slug(result['normalized_name'])

        return result

    def _fallback_normalize(self, raw_name: str) -> Dict:
        """Last resort normalization when everything else fails"""

        # Try to extract brand from known list
        brands = ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Honor',
                 'OnePlus', 'Google', 'Huawei', 'Motorola', 'Nokia', 'Infinix', 'Tecno']

        brand = 'Unknown'
        for b in brands:
            if b.lower() in raw_name.lower():
                brand = b
                break

        return {
            'brand': brand,
            'model': raw_name,
            'variant': '',
            'normalized_name': raw_name,
            'slug': self._generate_slug(raw_name)
        }

    def _generate_slug(self, name: str) -> str:
        """Generate URL-safe slug from product name"""
        slug = name.lower()
        slug = slug.replace(' ', '-')
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        slug = re.sub(r'-+', '-', slug)  # Remove multiple consecutive dashes
        return slug[:200]  # Limit length
