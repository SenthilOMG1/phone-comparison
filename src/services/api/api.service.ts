/**
 * API Service Layer
 * Connects frontend to FastAPI backend
 * Base URL configurable via environment variable
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ==========================================
// DASHBOARD ENDPOINTS
// ==========================================

export interface DashboardStats {
  total_products: number;
  active_retailers: number;
  products_in_stock: number;
  active_promotions: number;
  last_scrape_time: string;
}

export interface LatestPrice {
  product_name: string;
  brand: string;
  slug: string;
  retailer: string;
  price: number;
  original_price: number | null;
  in_stock: boolean;
  url: string;
  last_updated: string;
}

export interface LatestPricesResponse {
  prices: LatestPrice[];
  total_count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/api/dashboard/stats');
}

export async function getLatestPrices(
  brand?: string,
  retailer?: string,
  inStockOnly: boolean = false
): Promise<LatestPricesResponse> {
  const params = new URLSearchParams();
  if (brand) params.append('brand', brand);
  if (retailer) params.append('retailer', retailer);
  if (inStockOnly) params.append('in_stock_only', 'true');

  const query = params.toString();
  return apiFetch<LatestPricesResponse>(
    `/api/dashboard/latest-prices${query ? `?${query}` : ''}`
  );
}

// ==========================================
// PRODUCT ENDPOINTS
// ==========================================

export interface Product {
  id: number;
  brand: string;
  model: string;
  variant: string | null;
  normalized_name: string;
  slug: string;
  created_at: string;
}

export interface RetailerPrice {
  retailer: string;
  price: number;
  original_price: number | null;
  in_stock: boolean;
  url: string;
  last_updated: string;
}

export interface BestPriceResponse {
  product: Product;
  best_price: RetailerPrice;
  all_prices: RetailerPrice[];
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  retailer: string;
}

export interface PriceHistoryResponse {
  product: Product;
  history: PriceHistoryPoint[];
  days: number;
}

export interface ProductListItem {
  id: number;
  name: string;
  brand: string;
  model: string;
  slug: string;
  best_price: number;
  retailer: string;
  in_stock: boolean;
  url: string | null;
}

export interface ProductsListResponse {
  count: number;
  products: ProductListItem[];
}

export async function getAllProducts(limit?: number, brand?: string): Promise<ProductsListResponse> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (brand) params.append('brand', brand);

  const query = params.toString();
  return apiFetch<ProductsListResponse>(
    `/api/products${query ? `?${query}` : ''}`
  );
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${slug}`);
}

export async function getBestPrice(slug: string): Promise<BestPriceResponse> {
  return apiFetch<BestPriceResponse>(`/api/products/${slug}/best-price`);
}

export async function getPriceHistory(
  slug: string,
  days: number = 30
): Promise<PriceHistoryResponse> {
  return apiFetch<PriceHistoryResponse>(
    `/api/products/${slug}/price-history?days=${days}`
  );
}

// ==========================================
// PROMOTIONS ENDPOINTS
// ==========================================

export interface Promotion {
  id: number;
  product_name: string;
  brand: string;
  slug: string;
  retailer: string;
  title: string;
  description: string | null;
  discount_percentage: number | null;
  original_price: number | null;
  discounted_price: number;
  valid_from: string;
  valid_until: string | null;
  source_url: string | null;
  created_at: string;
}

export interface PromotionsResponse {
  promotions: Promotion[];
  total_count: number;
}

export async function getActivePromotions(
  brand?: string,
  retailer?: string
): Promise<PromotionsResponse> {
  const params = new URLSearchParams();
  if (brand) params.append('brand', brand);
  if (retailer) params.append('retailer', retailer);

  const query = params.toString();
  return apiFetch<PromotionsResponse>(
    `/api/promotions/active${query ? `?${query}` : ''}`
  );
}

// ==========================================
// MARKET INTELLIGENCE ENDPOINTS
// ==========================================

export interface BrandStats {
  brand: string;
  product_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  in_stock_count: number;
}

export interface BrandComparisonResponse {
  brands: BrandStats[];
}

export interface RetailerStats {
  retailer: string;
  product_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  in_stock_count: number;
}

export interface RetailerComparisonResponse {
  retailers: RetailerStats[];
}

export async function getBrandComparison(): Promise<BrandComparisonResponse> {
  return apiFetch<BrandComparisonResponse>('/api/market/brand-comparison');
}

export async function getRetailerComparison(): Promise<RetailerComparisonResponse> {
  return apiFetch<RetailerComparisonResponse>('/api/market/retailer-comparison');
}

// ==========================================
// MONITORING ENDPOINTS
// ==========================================

export interface ScraperLog {
  id: number;
  retailer: string;
  status: 'success' | 'failed' | 'partial';
  products_found: number;
  errors: string | null;
  execution_time_ms: number;
  created_at: string;
}

export interface ScraperLogsResponse {
  logs: ScraperLog[];
  total_count: number;
}

export async function getScraperLogs(limit: number = 50): Promise<ScraperLogsResponse> {
  return apiFetch<ScraperLogsResponse>(`/api/scrapers/logs?limit=${limit}`);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if backend API is reachable
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get API base URL (useful for debugging)
 */
export function getAPIBaseURL(): string {
  return API_BASE_URL;
}
