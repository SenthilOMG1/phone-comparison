import { useQuery } from '@tanstack/react-query';
import { getBrandComparison, getRetailerComparison } from '../../services/api';
import { Card } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Store, DollarSign, Package } from 'lucide-react';

export function MarketIntelligence() {
  const { data: brandData, isLoading: brandsLoading } = useQuery({
    queryKey: ['brandComparison'],
    queryFn: getBrandComparison,
    refetchInterval: 300000,
  });

  const { data: retailerData, isLoading: retailersLoading } = useQuery({
    queryKey: ['retailerComparison'],
    queryFn: getRetailerComparison,
    refetchInterval: 300000,
  });

  // Calculate Honor's market position
  const honorStats = brandData?.brands.find((b) => b.brand === 'Honor');
  const allBrands = brandData?.brands || [];
  const avgMarketPrice = allBrands.reduce((sum, b) => sum + b.avg_price, 0) / (allBrands.length || 1);
  const honorPriceDiff = honorStats
    ? ((honorStats.avg_price - avgMarketPrice) / avgMarketPrice) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
          <p className="text-gray-600 mt-2">
            Competitive analysis across Mauritius phone retailers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Honor Market Position Highlight */}
        {honorStats && (
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Honor Market Position</h2>
                <p className="text-blue-100 mb-4">
                  Your competitive advantage in Mauritius
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Products</p>
                    <p className="text-3xl font-bold">{honorStats.product_count}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Avg Price</p>
                    <p className="text-3xl font-bold">
                      {(honorStats.avg_price / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">In Stock</p>
                    <p className="text-3xl font-bold">{honorStats.in_stock_count}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">vs Market</p>
                    <p className="text-3xl font-bold">
                      {honorPriceDiff > 0 ? '+' : ''}
                      {honorPriceDiff.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <TrendingUp className="w-16 h-16 text-blue-200" />
            </div>
          </Card>
        )}

        {/* Brand Comparison Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Brand Comparison
          </h2>

          {brandsLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              {/* Brand Stats Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Products
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        In Stock
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Avg Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Min Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Max Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...allBrands]
                      .sort((a, b) => b.product_count - a.product_count)
                      .map((brand) => (
                        <tr
                          key={brand.brand}
                          className={`hover:bg-gray-50 ${
                            brand.brand === 'Honor' ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {brand.brand}
                            {brand.brand === 'Honor' && (
                              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                YOU
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {brand.product_count}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {brand.in_stock_count}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            MUR {brand.avg_price.toLocaleString('en-MU')}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            MUR {brand.min_price.toLocaleString('en-MU')}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            MUR {brand.max_price.toLocaleString('en-MU')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Average Price Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Average Price by Brand
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[...allBrands].sort((a, b) => b.avg_price - a.avg_price)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="brand" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `MUR ${value.toLocaleString('en-MU')}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="avg_price"
                      fill="#3b82f6"
                      name="Average Price"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Product Count Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Count by Brand
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[...allBrands].sort((a, b) => b.product_count - a.product_count)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="brand" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="product_count"
                      fill="#10b981"
                      name="Total Products"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="in_stock_count"
                      fill="#f59e0b"
                      name="In Stock"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>

        {/* Retailer Comparison Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Retailer Comparison
          </h2>

          {retailersLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : retailerData ? (
            <>
              {/* Retailer Stats Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Retailer
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Products
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        In Stock
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Avg Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Price Range
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...retailerData.retailers]
                      .sort((a, b) => b.product_count - a.product_count)
                      .map((retailer) => (
                        <tr key={retailer.retailer} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {retailer.retailer}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {retailer.product_count}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {retailer.in_stock_count}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            MUR {retailer.avg_price.toLocaleString('en-MU')}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {retailer.min_price.toLocaleString('en-MU')} -{' '}
                            {retailer.max_price.toLocaleString('en-MU')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Retailer Average Price Comparison */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Average Price by Retailer
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[...retailerData.retailers].sort((a, b) => a.avg_price - b.avg_price)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="retailer" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `MUR ${value.toLocaleString('en-MU')}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="avg_price"
                      fill="#8b5cf6"
                      name="Average Price"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : null}
        </Card>

        {/* Key Insights */}
        <Card className="p-6 bg-gray-50 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Key Insights
          </h2>
          <div className="space-y-3">
            {honorStats && (
              <>
                <InsightCard
                  title="Price Positioning"
                  description={
                    honorPriceDiff < 0
                      ? `Honor phones are ${Math.abs(honorPriceDiff).toFixed(
                          1
                        )}% cheaper than market average`
                      : `Honor phones are ${honorPriceDiff.toFixed(
                          1
                        )}% more expensive than market average`
                  }
                  type={honorPriceDiff < 0 ? 'success' : 'warning'}
                />
                <InsightCard
                  title="Stock Availability"
                  description={`${honorStats.in_stock_count} out of ${honorStats.product_count} Honor products are in stock`}
                  type="info"
                />
              </>
            )}
            {retailerData && retailerData.retailers.length > 0 && (
              <InsightCard
                title="Retailer Coverage"
                description={`Tracking ${retailerData.retailers.length} active retailers across Mauritius`}
                type="success"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

function InsightCard({ title, description, type }: InsightCardProps) {
  const colors = {
    success: 'border-green-500 bg-green-50 text-green-900',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    info: 'border-blue-500 bg-blue-50 text-blue-900',
  };

  return (
    <div className={`border-l-4 p-4 ${colors[type]}`}>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}
