import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getLatestPrices,
  getBrandComparison,
  getActivePromotions,
  getScraperLogs
} from '../../services/api';
import { Card } from '../../components/ui';
import {
  TrendingUp,
  Store,
  Package,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function Dashboard() {
  // Fetch all dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: latestPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: () => getLatestPrices(undefined, undefined, true),
    refetchInterval: 60000,
  });

  const { data: brandComparison, isLoading: brandsLoading } = useQuery({
    queryKey: ['brandComparison'],
    queryFn: getBrandComparison,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: promotions, isLoading: promotionsLoading } = useQuery({
    queryKey: ['activePromotions'],
    queryFn: () => getActivePromotions(),
    refetchInterval: 300000,
  });

  const { data: scraperLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['scraperLogs'],
    queryFn: () => getScraperLogs(10),
    refetchInterval: 60000,
  });

  // Error state
  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Connect to Backend
            </h2>
            <p className="text-gray-600 mb-4">
              Make sure the backend API is running at http://localhost:8000
            </p>
            <code className="block bg-gray-100 p-4 rounded text-sm text-left">
              cd backend<br />
              python api/main.py
            </code>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MobiMEA CEO Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Live market intelligence for Mauritius phone retailers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats?.total_products || 0}
            icon={<Package />}
            color="blue"
          />
          <StatCard
            title="Active Retailers"
            value={stats?.active_retailers || 0}
            icon={<Store />}
            color="green"
          />
          <StatCard
            title="In Stock"
            value={stats?.products_in_stock || 0}
            icon={<CheckCircle />}
            color="emerald"
          />
          <StatCard
            title="Active Promotions"
            value={stats?.active_promotions || 0}
            icon={<Tag />}
            color="orange"
          />
        </div>

        {/* Last Scrape Time */}
        {stats?.last_scrape_time && (
          <Card className="p-4 flex items-center gap-3 bg-blue-50 border-blue-200">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900">
              Last updated: {new Date(stats.last_scrape_time).toLocaleString('en-MU')}
            </span>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Comparison */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Brand Market Position
            </h2>
            {brandsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {brandComparison?.brands
                  .sort((a, b) => b.product_count - a.product_count)
                  .slice(0, 5)
                  .map((brand) => (
                    <div key={brand.brand} className="border-b border-gray-200 last:border-0 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{brand.brand}</h3>
                          <p className="text-sm text-gray-600">
                            {brand.product_count} products • {brand.in_stock_count} in stock
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            MUR {brand.avg_price.toLocaleString('en-MU')}
                          </p>
                          <p className="text-xs text-gray-500">avg price</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Min: MUR {brand.min_price.toLocaleString('en-MU')}</span>
                        <span>Max: MUR {brand.max_price.toLocaleString('en-MU')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* Active Promotions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Active Promotions
            </h2>
            {promotionsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : promotions && promotions.promotions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {promotions.promotions.slice(0, 5).map((promo) => (
                  <div key={promo.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{promo.title}</h3>
                      {promo.discount_percentage && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          -{promo.discount_percentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{promo.product_name}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{promo.retailer}</span>
                      <span className="font-bold text-orange-600">
                        MUR {promo.discounted_price.toLocaleString('en-MU')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No active promotions</p>
            )}
          </Card>
        </div>

        {/* Latest Prices Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Prices</h2>
          {pricesLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : latestPrices && latestPrices.prices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Retailer
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {latestPrices.prices.slice(0, 10).map((price, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{price.product_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{price.brand}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{price.retailer_name}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div>
                          <span className="font-semibold text-gray-900">
                            MUR {price.price_cash?.toLocaleString('en-MU') || 'N/A'}
                          </span>
                          {price.original_price && price.original_price > (price.price_cash || 0) && (
                            <div className="text-xs text-gray-500 line-through">
                              MUR {price.original_price.toLocaleString('en-MU')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {price.in_stock ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No prices available</p>
          )}
        </Card>

        {/* Scraper Health */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Scraper Health</h2>
          {logsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : scraperLogs && scraperLogs.logs.length > 0 ? (
            <div className="space-y-3">
              {scraperLogs.logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : log.status === 'partial' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{log.retailer}</p>
                      <p className="text-sm text-gray-600">
                        {log.products_found} products • {log.execution_time_ms}ms
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('en-MU')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No scraper logs available</p>
          )}
        </Card>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'emerald' | 'orange';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-50',
    green: 'bg-green-500 text-green-50',
    emerald: 'bg-emerald-500 text-emerald-50',
    orange: 'bg-orange-500 text-orange-50',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('en-MU')}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
