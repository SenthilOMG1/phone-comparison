import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getScraperLogs, getLatestPrices, getBrandComparison } from '../../services/api';
import { RefreshCw, Database, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function AdminPanel() {
  const [selectedRetailer, setSelectedRetailer] = useState<string>('all');

  // Fetch scraper logs
  const { data: scraperLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['scraperLogs'],
    queryFn: () => getScraperLogs(50),
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Fetch latest prices
  const { data: pricesData, isLoading: pricesLoading } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: () => getLatestPrices(),
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Fetch brand comparison
  const { data: brandsData } = useQuery({
    queryKey: ['brandComparison'],
    queryFn: getBrandComparison,
  });

  const retailers = ['All', 'Courts Mauritius', 'Galaxy', 'Price Guru', '361 Degrees', 'Emtel', 'JKalachand'];

  const filteredPrices = selectedRetailer === 'all'
    ? pricesData?.prices || []
    : pricesData?.prices?.filter(p => p.retailer_name === selectedRetailer) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-purple-300">Monitor scrapers and view collected data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-semibold">Total Products</h3>
            </div>
            <p className="text-3xl font-bold text-white">{pricesData?.total_count || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-semibold">Brands Tracked</h3>
            </div>
            <p className="text-3xl font-bold text-white">{brandsData?.brands?.length || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-semibold">Retailers</h3>
            </div>
            <p className="text-3xl font-bold text-white">6</p>
            <p className="text-xs text-purple-300 mt-1">Active scrapers</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-semibold">Last Run</h3>
            </div>
            <p className="text-sm font-bold text-white">
              {scraperLogs?.logs?.[0]?.created_at
                ? new Date(scraperLogs.logs[0].created_at).toLocaleTimeString()
                : 'Never'}
            </p>
          </div>
        </div>

        {/* Scraper Logs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Scraper Activity</h2>
            <button
              onClick={() => refetchLogs()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {logsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-white/60">Loading logs...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scraperLogs?.logs?.map((log: any) => (
                <div
                  key={log.id}
                  className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-semibold">{log.retailer}</p>
                      <p className="text-sm text-purple-300">
                        {log.products_found || 0} products found in {((log.execution_time_ms || 0) / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Latest Prices</h2>
            <select
              value={selectedRetailer}
              onChange={(e) => setSelectedRetailer(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-white/20 rounded-lg text-white"
            >
              {retailers.map(retailer => (
                <option key={retailer} value={retailer.toLowerCase() === 'all' ? 'all' : retailer}>
                  {retailer}
                </option>
              ))}
            </select>
          </div>

          {pricesLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-white/60">Loading prices...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">Brand</th>
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">Retailer</th>
                    <th className="text-right py-3 px-4 text-purple-300 font-semibold">Price (MUR)</th>
                    <th className="text-center py-3 px-4 text-purple-300 font-semibold">Stock</th>
                    <th className="text-right py-3 px-4 text-purple-300 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((product: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-purple-400 transition-colors"
                        >
                          {product.product_name}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-purple-200">{product.brand}</td>
                      <td className="py-3 px-4 text-white/80">{product.retailer_name}</td>
                      <td className="py-3 px-4 text-right">
                        <div>
                          <p className="text-white font-semibold">Rs {product.price_cash?.toLocaleString() || 'N/A'}</p>
                          {product.original_price && (
                            <p className="text-xs text-red-400 line-through">
                              Rs {product.original_price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {product.in_stock ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">In Stock</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Out</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-white/60">
                        {new Date(product.last_updated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
