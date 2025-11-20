-- MobiMEA Intelligence Platform Database Schema

-- Enable TimescaleDB extension for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Products table (canonical phone data)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100),
    specs JSONB DEFAULT '{}',
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailers table
CREATE TABLE IF NOT EXISTS retailers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    website_url VARCHAR(255),
    facebook_url VARCHAR(255),
    scraper_type VARCHAR(50) DEFAULT 'traditional', -- 'traditional' or 'facebook_only'
    is_active BOOLEAN DEFAULT TRUE,
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailer links (mapping products to retailer listings)
CREATE TABLE IF NOT EXISTS retailer_links (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    retailer_id INT REFERENCES retailers(id) ON DELETE CASCADE,
    original_url TEXT,
    scraped_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, retailer_id)
);

-- Prices table (TimescaleDB hypertable for time-series data)
CREATE TABLE IF NOT EXISTS prices (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    link_id INT REFERENCES retailer_links(id) ON DELETE CASCADE,
    price_cash NUMERIC(10, 2),
    price_credit NUMERIC(10, 2),
    original_price NUMERIC(10, 2),  -- For showing discounts
    currency VARCHAR(3) DEFAULT 'MUR',
    in_stock BOOLEAN DEFAULT TRUE,
    stock_status VARCHAR(50),  -- 'in_stock', 'out_of_stock', 'pre_order', 'limited'
    promo_text TEXT,
    PRIMARY KEY (time, link_id)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('prices', 'time', if_not_exists => TRUE);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    retailer_id INT REFERENCES retailers(id) ON DELETE CASCADE,
    promo_type VARCHAR(50),  -- 'discount', 'bundle', 'flash_sale', 'trade_in', 'cashback'
    description TEXT,
    discount_amount NUMERIC(10, 2),
    discount_percentage NUMERIC(5, 2),
    start_date DATE,
    end_date DATE,
    source VARCHAR(50),  -- 'website', 'facebook'
    source_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraper logs (monitoring and debugging)
CREATE TABLE IF NOT EXISTS scraper_logs (
    id SERIAL PRIMARY KEY,
    retailer_id INT REFERENCES retailers(id),
    status VARCHAR(20),  -- 'success', 'failed', 'partial'
    products_found INT DEFAULT 0,
    products_updated INT DEFAULT 0,
    errors TEXT,
    execution_time_ms INT,
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prices_link_time ON prices(link_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_products_brand_model ON products(brand, model);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, end_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_retailer_links_product ON retailer_links(product_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_scraper_logs_retailer ON scraper_logs(retailer_id, scraped_at DESC);

-- Insert initial retailers
INSERT INTO retailers (name, website_url, facebook_url, scraper_type) VALUES
('Courts Mauritius', 'https://www.courtsmammouth.mu/', 'https://www.facebook.com/courtsmauritius', 'traditional'),
('Galaxy', 'https://www.galaxy.mu/', 'https://www.facebook.com/galaxymauritius', 'traditional'),
('Price Guru', 'https://priceguru.mu/', 'https://www.facebook.com/pricegurumu', 'traditional'),
('361 Degrees', 'https://361.mu/', 'https://www.facebook.com/361mauritius', 'traditional')
ON CONFLICT (name) DO NOTHING;

-- Create view for latest prices
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (rl.product_id, rl.retailer_id)
    p.id as product_id,
    p.name as product_name,
    p.brand,
    p.model,
    p.slug,
    r.id as retailer_id,
    r.name as retailer_name,
    pr.price_cash,
    pr.price_credit,
    pr.original_price,
    pr.in_stock,
    pr.stock_status,
    pr.promo_text,
    rl.original_url,
    pr.time as last_updated
FROM products p
JOIN retailer_links rl ON p.id = rl.product_id
JOIN retailers r ON rl.retailer_id = r.id
JOIN prices pr ON rl.id = pr.link_id
WHERE rl.is_active = TRUE
ORDER BY rl.product_id, rl.retailer_id, pr.time DESC;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM retailers WHERE is_active = TRUE) as active_retailers,
    (SELECT COUNT(*) FROM latest_prices WHERE in_stock = TRUE) as products_in_stock,
    (SELECT COUNT(*) FROM promotions WHERE is_active = TRUE AND (end_date IS NULL OR end_date >= CURRENT_DATE)) as active_promotions,
    (SELECT MAX(scraped_at) FROM scraper_logs) as last_scrape_time;
