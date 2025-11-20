"""
Facebook Promotion Monitor
Uses Gemini Vision API to extract promotion details from Facebook posts/images
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import requests
from io import BytesIO

load_dotenv()

class FacebookPromotionMonitor:
    """Monitor Facebook for phone promotions using Gemini Vision"""

    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_promotion_image(self, image_path_or_url: str) -> Optional[Dict]:
        """
        Analyze a Facebook promotion image to extract phone deals

        Args:
            image_path_or_url: Local path or URL to promotion image

        Returns:
            Dictionary with promotion details or None if no valid promotion found
        """
        try:
            # Load image
            if image_path_or_url.startswith('http'):
                response = requests.get(image_path_or_url)
                img = Image.open(BytesIO(response.content))
            else:
                img = Image.open(image_path_or_url)

            # Prompt for Gemini Vision
            prompt = """
Analyze this Facebook promotion image for phone deals.

Extract the following information if present:
1. Product name (exact phone model)
2. Brand (Samsung, Xiaomi, Honor, iPhone, etc.)
3. Original price (in Mauritian Rupees if shown)
4. Discounted/sale price (in Mauritian Rupees)
5. Discount percentage (if mentioned)
6. Promotion title/description
7. Valid until date (if mentioned)
8. Retailer name (Courts, Galaxy, Price Guru, 361, etc.)

Return ONLY a JSON object with this structure (no markdown, no extra text):
{
  "is_phone_promotion": true/false,
  "product_name": "exact product name",
  "brand": "brand name",
  "original_price": number or null,
  "discounted_price": number,
  "discount_percentage": number or null,
  "title": "promotion title",
  "description": "brief description",
  "valid_until": "YYYY-MM-DD or null",
  "retailer": "retailer name or Unknown"
}

If this is NOT a phone promotion, return:
{"is_phone_promotion": false}
"""

            # Call Gemini Vision API
            response = self.model.generate_content([prompt, img])

            if not response.text:
                print("No response from Gemini Vision")
                return None

            # Parse JSON response
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            promotion_data = json.loads(response_text)

            # Validate
            if not promotion_data.get('is_phone_promotion'):
                print("Image is not a phone promotion")
                return None

            # Add metadata
            promotion_data['extracted_at'] = datetime.now().isoformat()
            promotion_data['source'] = 'facebook'

            return promotion_data

        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini response as JSON: {e}")
            print(f"Response was: {response.text[:200]}")
            return None
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            return None

    def analyze_promotion_text(self, post_text: str, retailer: str = 'Unknown') -> Optional[Dict]:
        """
        Analyze Facebook post text to extract phone promotion details

        Args:
            post_text: Text content of Facebook post
            retailer: Name of retailer (Courts, Galaxy, etc.)

        Returns:
            Dictionary with promotion details or None
        """
        try:
            prompt = f"""
Analyze this Facebook post for phone promotions.

Post text:
{post_text}

Extract the following information if present:
1. Product name (exact phone model)
2. Brand (Samsung, Xiaomi, Honor, iPhone, etc.)
3. Original price (in Mauritian Rupees)
4. Discounted/sale price (in Mauritian Rupees)
5. Discount percentage (if mentioned)
6. Promotion description
7. Valid until date (if mentioned)

Return ONLY a JSON object with this structure (no markdown):
{{
  "is_phone_promotion": true/false,
  "product_name": "exact product name or null",
  "brand": "brand name or null",
  "original_price": number or null,
  "discounted_price": number or null,
  "discount_percentage": number or null,
  "title": "promotion title",
  "description": "brief description",
  "valid_until": "YYYY-MM-DD or null",
  "retailer": "{retailer}"
}}

If this is NOT a phone promotion, return:
{{"is_phone_promotion": false}}
"""

            response = self.model.generate_content(prompt)

            if not response.text:
                return None

            # Parse JSON response
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            promotion_data = json.loads(response_text)

            if not promotion_data.get('is_phone_promotion'):
                return None

            # Add metadata
            promotion_data['extracted_at'] = datetime.now().isoformat()
            promotion_data['source'] = 'facebook'
            promotion_data['retailer'] = retailer

            return promotion_data

        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini response as JSON: {e}")
            return None
        except Exception as e:
            print(f"Error analyzing text: {str(e)}")
            return None

    def batch_analyze_images(self, image_paths: List[str]) -> List[Dict]:
        """
        Analyze multiple promotion images in batch

        Args:
            image_paths: List of image paths or URLs

        Returns:
            List of promotion dictionaries
        """
        promotions = []

        for image_path in image_paths:
            print(f"Analyzing: {image_path}")
            result = self.analyze_promotion_image(image_path)

            if result:
                promotions.append(result)
                print(f"  ✓ Found promotion: {result.get('product_name', 'Unknown')}")
            else:
                print(f"  ✗ No promotion found")

        return promotions


def test_facebook_monitor():
    """Test the Facebook monitor with sample data"""

    monitor = FacebookPromotionMonitor()

    # Test with sample post text
    sample_post = """
🔥 MEGA SALE! 🔥

Samsung Galaxy S24 Ultra 256GB
Was: MUR 65,000
NOW: MUR 58,900
Save 10%!

Limited stock available!
Offer valid until December 31, 2024

Visit us at Courts Mauritius
"""

    print("Testing text analysis...")
    result = monitor.analyze_promotion_text(sample_post, retailer="Courts Mauritius")

    if result:
        print("\nExtracted promotion:")
        print(json.dumps(result, indent=2))
    else:
        print("No promotion found in text")


if __name__ == '__main__':
    test_facebook_monitor()
