-- Migration: Add specifications and images columns to products table
-- This allows storing complete phone specs from scrapers

-- Add specifications column (JSONB for flexible spec storage)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

-- Add images column (array of image URLs)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment explaining the schema
COMMENT ON COLUMN products.specifications IS 'Complete phone specifications in JSON format: display, processor, memory, camera, battery, connectivity, software, physical';
COMMENT ON COLUMN products.images IS 'Array of product image URLs from retailer websites';

-- Create index on specifications for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_products_specifications ON products USING GIN (specifications);

-- Example specifications structure:
/*
{
  "display": {
    "size": "6.77 inches",
    "resolution": "1610 x 720 pixels",
    "type": "TFT LCD",
    "refresh_rate": "120Hz"
  },
  "processor": {
    "chipset": "Qualcomm Snapdragon 685",
    "cpu": "Octa Core 2.8 GHz",
    "gpu": "Adreno 610"
  },
  "memory": {
    "ram": "8GB",
    "storage": "256GB",
    "expandable": "Yes"
  },
  "camera": {
    "main": "108MP",
    "ultrawide": "2MP",
    "front": "8MP",
    "features": ["Night mode", "HDR"]
  },
  "battery": {
    "capacity": "6000mAh",
    "fast_charging": "35W",
    "wireless_charging": "No"
  },
  "connectivity": {
    "network": "5G",
    "wifi": "Wi-Fi 5",
    "bluetooth": "5.1",
    "nfc": false,
    "usb": "USB-C"
  },
  "software": {
    "os": "Android 14",
    "ui": "MagicOS 8.0"
  },
  "physical": {
    "dimensions": "166.9 x 76.8 x 8.1 mm",
    "weight": "194g",
    "build": "Glass front, plastic back",
    "colors": ["Forest Green", "Midnight Black"]
  }
}
*/
