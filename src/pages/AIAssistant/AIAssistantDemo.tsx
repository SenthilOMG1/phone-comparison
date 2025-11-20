import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getLatestPrices, getBrandComparison } from '../../services/api';
import { Card } from '../../components/ui';
import { Wand2, Sparkles, TrendingUp, Download, AlertCircle } from 'lucide-react';

export function AIAssistant() {
  const [request, setRequest] = useState('');
  const [generatedTools, setGeneratedTools] = useState<Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    code: string;
    timestamp: Date;
  }>>([]);
  const [insights, setInsights] = useState<{
    summary: string;
    insights: string[];
    recommendations: string[];
  } | null>(null);

  // Fetch available data
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: pricesData } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: () => getLatestPrices(),
  });

  const { data: marketData } = useQuery({
    queryKey: ['brandComparison'],
    queryFn: getBrandComparison,
  });

  const handleGenerateTool = async () => {
    if (!request.trim()) return;

    // Demo: Generate sample code based on request keywords
    let sampleCode = '';
    let title = '';
    let type: 'chart' | 'table' | 'dashboard' | 'custom' = 'chart';

    if (request.toLowerCase().includes('bar chart') || request.toLowerCase().includes('bar')) {
      title = 'Brand Price Comparison Bar Chart';
      type = 'chart';
      sampleCode = `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: any;
}

export function BrandPriceChart({ data }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Average Price by Brand
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.brands}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="brand" />
          <YAxis />
          <Tooltip formatter={(value) => \`MUR \${value.toLocaleString()}\`} />
          <Legend />
          <Bar dataKey="avg_price" fill="#3b82f6" name="Average Price" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}`;
    } else if (request.toLowerCase().includes('pie chart') || request.toLowerCase().includes('pie')) {
      title = 'Product Distribution Pie Chart';
      type = 'chart';
      sampleCode = `import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Props {
  data: any;
}

export function ProductDistribution({ data }: Props) {
  const chartData = data.brands.map(b => ({
    name: b.brand,
    value: b.product_count
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Product Distribution by Brand
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => \`\${name}: \${(percent * 100).toFixed(0)}%\`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}`;
    } else if (request.toLowerCase().includes('table')) {
      title = 'Top Products Table';
      type = 'table';
      sampleCode = `interface Props {
  data: any;
}

export function TopProductsTable({ data }: Props) {
  const sortedPrices = data.prices.sort((a, b) => a.price - b.price).slice(0, 10);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Top 10 Best Deals
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Retailer</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPrices.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{product.product_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.retailer}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  MUR {product.price.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;
    } else {
      title = 'Custom Dashboard Component';
      type = 'dashboard';
      sampleCode = `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: any;
}

export function CustomDashboard({ data }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Custom Market Dashboard
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Products</p>
          <p className="text-3xl font-bold text-blue-900">{data.dashboard?.total_products || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Retailers</p>
          <p className="text-3xl font-bold text-green-900">{data.dashboard?.active_retailers || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">In Stock</p>
          <p className="text-3xl font-bold text-purple-900">{data.dashboard?.products_in_stock || 0}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.brands}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="brand" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="product_count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}`;
    }

    const newTool = {
      id: Date.now().toString(),
      title,
      description: `Interactive ${type} for: ${request}`,
      type,
      code: sampleCode,
      timestamp: new Date(),
    };

    setGeneratedTools([newTool, ...generatedTools]);
    setRequest('');
  };

  const handleGenerateInsights = async () => {
    // Demo insights based on actual data
    const honorBrand = marketData?.brands.find(b => b.brand === 'Honor');
    const samsungBrand = marketData?.brands.find(b => b.brand === 'Samsung');

    const avgMarketPrice = marketData?.brands.reduce((sum, b) => sum + b.avg_price, 0) / (marketData?.brands.length || 1);
    const honorPriceDiff = honorBrand ? ((honorBrand.avg_price - avgMarketPrice) / avgMarketPrice * 100) : 0;

    setInsights({
      summary: `MobiMEA's Honor product line shows ${honorPriceDiff < 0 ? 'strong competitive' : 'premium'} positioning in the Mauritius market, with prices averaging ${Math.abs(honorPriceDiff).toFixed(1)}% ${honorPriceDiff < 0 ? 'below' : 'above'} market average while maintaining ${honorBrand?.in_stock_count || 0} products in stock.`,
      insights: [
        `Honor average price: MUR ${honorBrand?.avg_price.toLocaleString() || 0} vs Samsung: MUR ${samsungBrand?.avg_price.toLocaleString() || 0}`,
        `${((dashboardData?.products_in_stock || 0) / (dashboardData?.total_products || 1) * 100).toFixed(0)}% overall stock availability across all retailers`,
        `${marketData?.brands.length || 0} brands actively competing in Mauritius market`,
        `Price Guru and 361 Degrees show competitive pricing strategies`
      ],
      recommendations: [
        'Emphasize Honor\'s price-value proposition in marketing campaigns targeting budget-conscious customers',
        'Monitor Courts and Galaxy pricing weekly for early competitive response opportunities',
        'Consider bundle deals (phone + accessories) to increase average transaction value',
        'Highlight Honor\'s full stock availability as competitive advantage during peak shopping seasons'
      ]
    });
  };

  const suggestedRequests = [
    'Show me a bar chart comparing average prices across brands',
    'Create a pie chart showing product count by brand',
    'Make a table of top 10 cheapest phones in stock',
    'Build a dashboard showing Honor vs competitors',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-10 h-10" />
            <h1 className="text-4xl font-bold">AI Assistant (Demo)</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Generate custom visualizations and insights on-demand
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Demo Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Demo Mode:</strong> This version generates sample React components based on your request keywords.
              The full version with Gemini AI integration will generate custom code for any visualization you describe.
            </div>
          </div>
        </Card>

        {/* Tool Generator */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Generate Custom Tool</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to visualize?
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="Example: Create a bar chart comparing Honor vs Samsung prices..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateTool}
                disabled={!request.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Wand2 className="w-5 h-5" />
                Generate Tool
              </button>

              <button
                onClick={handleGenerateInsights}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                Generate Insights
              </button>
            </div>

            {/* Suggested Requests */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Try these:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedRequests.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setRequest(suggestion)}
                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        {insights && (
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              AI-Generated Insights
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {insights.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Generated Tools */}
        {generatedTools.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Generated Tools</h2>

            {generatedTools.map((tool) => (
              <Card key={tool.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tool.title}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tool.code);
                      alert('Code copied to clipboard!');
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Copy Code
                  </button>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Generated Code
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
                    <code>{tool.code}</code>
                  </pre>
                </details>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
