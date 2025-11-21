"""
Scraper Configuration
Admin can toggle between agentic (default) and hybrid mode
"""

import json
import os
from typing import Literal

CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'scraper_settings.json')

ScraperMode = Literal['agentic', 'hybrid']

DEFAULT_SETTINGS = {
    'mode': 'agentic',  # Default to agentic (more detailed)
    'max_products': 50,  # Limit per scrape
    'retailers': {
        'Courts Mauritius': {
            'enabled': True,
            'url': 'https://www.courtsmammouth.mu/category/mobile-phones.html'
        },
        'Galaxy Electronics': {
            'enabled': True,
            'url': 'https://www.galaxy.mu/mobiles'
        },
        'Price Guru': {
            'enabled': False,
            'url': 'https://priceguru.mu/smartphones'
        },
        '361 Degrees': {
            'enabled': False,
            'url': 'https://361.mu/category/mobile-phones'
        }
    }
}

def load_settings() -> dict:
    """Load scraper settings from file"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return DEFAULT_SETTINGS.copy()

def save_settings(settings: dict):
    """Save scraper settings to file"""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(settings, f, indent=2)

def get_scraper_mode() -> ScraperMode:
    """Get current scraper mode"""
    settings = load_settings()
    return settings.get('mode', 'agentic')

def set_scraper_mode(mode: ScraperMode):
    """Set scraper mode (agentic or hybrid)"""
    settings = load_settings()
    settings['mode'] = mode
    save_settings(settings)
    print(f"[CONFIG] Scraper mode set to: {mode}")

def get_enabled_retailers() -> list:
    """Get list of enabled retailers"""
    settings = load_settings()
    retailers = settings.get('retailers', {})
    return [
        {'name': name, 'url': config['url']}
        for name, config in retailers.items()
        if config.get('enabled', False)
    ]

def get_max_products() -> int:
    """Get max products per scrape"""
    settings = load_settings()
    return settings.get('max_products', 50)

# Initialize settings file if it doesn't exist
if not os.path.exists(CONFIG_FILE):
    save_settings(DEFAULT_SETTINGS)
    print(f"[CONFIG] Created default settings at {CONFIG_FILE}")
