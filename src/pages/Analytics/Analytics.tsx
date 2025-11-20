import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPriceHistory, getLatestPrices } from '../../services/api';
import { Card } from '../../components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, BarChart3, Calendar, AlertCircle } from 'lucide-react';

export function Analytics() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [days, setDays] = useState<number>(30);

  // Fetch available products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['availableProducts'],
    queryFn: () => getLatestPrices(),
  });

  // Fetch price history for selected product
  const {
    data: priceHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ['priceHistory', selectedProduct, days],
    queryFn: () => getPriceHistory(selectedProduct, days),
    enabled: !!selectedProduct,
    refetchInterval: 60000,
  });

  // Get unique products for dropdown
  const products = productsData
    ? Array.from(
        new Map(
          productsData.prices.map((p) => [p.slug, { name: p.product_name, slug: p.slug }])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Process price history data for chart
  const chartData = priceHistory
    ? priceHistory.history.map((point) => ({
        date: new Date(point.timestamp).toLocaleDateString('en-MU'),
        price: point.price,
        retailer: point.retailer,
      }))
    : [];

  // Calculate price trend
  const calculateTrend = () => {
    if (!priceHistory || priceHistory.history.length < 2) return null;

    const history = priceHistory.history.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const firstPrice = history[0].price;
    const lastPrice = history[history.length - 1].price;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      change,
      changePercent,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  };

  const trend = calculateTrend();

  // Calculate price statistics
  const priceStats = priceHistory
    ? {
        min: Math.min(...priceHistory.history.map((p) => p.price)),
        max: Math.max(...priceHistory.history.map((p) => p.price)),
        avg:
          priceHistory.history.reduce((sum, p) => sum + p.price, 0) /
          priceHistory.history.length,
        current: priceHistory.history[priceHistory.history.length - 1]?.price || 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Price Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Track price trends and history across retailers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Product Selection */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={productsLoading}
              >
                <option value="">
                  {productsLoading ? 'Loading products...' : 'Select a product'}
                </option>
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedProduct}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {historyError && selectedProduct && (
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Price History
            </h3>
            <p className="text-gray-600">
              Make sure the backend API is running and the product has price history.
            </p>
          </Card>
        )}

        {/* Empty State */}
        {!selectedProduct && !historyError && (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Product to View Analytics
            </h3>
            <p className="text-gray-600">
              Choose a product from the dropdown above to see its price history
            </p>
          </Card>
        )}

        {/* Loading State */}
        {historyLoading && selectedProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </Card>
              ))}
            </div>
            <Card className="p-6 animate-pulse">
              <div className="h-96 bg-gray-200 rounded"></div>
            </Card>
          </div>
        )}

        {/* Analytics Dashboard */}
        {priceHistory && priceStats && !historyLoading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Current Price"
                value={`MUR ${priceStats.current.toLocaleString('en-MU')}`}
                icon={<Calendar />}
                color="blue"
              />
              <StatCard
                title="Average Price"
                value={`MUR ${Math.round(priceStats.avg).toLocaleString('en-MU')}`}
                icon={<Minus />}
                color="gray"
              />
              <StatCard
                title="Lowest Price"
                value={`MUR ${priceStats.min.toLocaleString('en-MU')}`}
                icon={<TrendingDown />}
                color="green"
              />
              <StatCard
                title="Highest Price"
                value={`MUR ${priceStats.max.toLocaleString('en-MU')}`}
                icon={<TrendingUp />}
                color="red"
              />
            </div>

            {/* Trend Indicator */}
            {trend && (
              <Card
                className={`p-6 ${
                  trend.direction === 'down'
                    ? 'bg-green-50 border-green-200'
                    : trend.direction === 'up'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {trend.direction === 'down' ? (
                    <TrendingDown className="w-8 h-8 text-green-600" />
                  ) : trend.direction === 'up' ? (
                    <TrendingUp className="w-8 h-8 text-red-600" />
                  ) : (
                    <Minus className="w-8 h-8 text-gray-600" />
                  )}
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        trend.direction === 'down'
                          ? 'text-green-900'
                          : trend.direction === 'up'
                          ? 'text-red-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {trend.direction === 'down'
                        ? 'Price Decreasing'
                        : trend.direction === 'up'
                        ? 'Price Increasing'
                        : 'Price Stable'}
                    </h3>
                    <p
                      className={`text-sm ${
                        trend.direction === 'down'
                          ? 'text-green-700'
                          : trend.direction === 'up'
                          ? 'text-red-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {trend.change > 0 ? '+' : ''}
                      {trend.change.toFixed(0)} MUR ({trend.changePercent > 0 ? '+' : ''}
                      {trend.changePercent.toFixed(1)}%) over {days} days
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Price History Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Price History - {priceHistory?.product?.normalized_name || selectedProduct}
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `MUR ${value.toLocaleString('en-MU')}`}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Price (MUR)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No price history data available for this period
                </div>
              )}
            </Card>

            {/* Price Data Table */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Price Records</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Retailer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {priceHistory.history
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(record.timestamp).toLocaleString('en-MU')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {record.retailer}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            MUR {record.price.toLocaleString('en-MU')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'gray' | 'green' | 'red';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-50',
    gray: 'bg-gray-500 text-gray-50',
    green: 'bg-green-500 text-green-50',
    red: 'bg-red-500 text-red-50',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
