import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getLatestPrices, getBrandComparison } from '../../services/api';
import { generateInteractiveTool, analyzeBusinessData } from '../../services/ai/gemini.service';
import { Card } from '../../components/ui';
import { Wand2, Sparkles, TrendingUp, Loader2, Download } from 'lucide-react';

export function AIAssistant() {
  const [request, setRequest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTools, setGeneratedTools] = useState<Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    code: string;
    component: React.ComponentType<any> | null;
    timestamp: Date;
  }>>([]);
  const [insights, setInsights] = useState<{
    summary: string;
    insights: string[];
    recommendations: string[];
  } | null>(null);

  // Fetch available data for tool generation
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
    if (!request.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Prepare available data
      const availableData = {
        dashboard: dashboardData,
        prices: pricesData?.prices || [],
        brands: marketData?.brands || [],
        chartData: marketData?.brands.map(b => ({
          name: b.brand,
          avgPrice: b.avg_price,
          products: b.product_count,
          inStock: b.in_stock_count,
        })) || [],
      };

      // Generate tool with Gemini
      const tool = await generateInteractiveTool(request, availableData);

      // Create dynamic component from code
      // Note: In production, use a safe sandboxed eval or iframe
      // For demo purposes, we'll store the code and show it
      const newTool = {
        id: Date.now().toString(),
        title: tool.title,
        description: tool.description,
        type: tool.type,
        code: tool.code,
        component: null, // In production, use react-live or sandboxed iframe
        timestamp: new Date(),
      };

      setGeneratedTools([newTool, ...generatedTools]);
      setRequest('');
    } catch (error) {
      console.error('Failed to generate tool:', error);
      alert('Failed to generate tool. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);

    try {
      const data = {
        dashboard: dashboardData,
        brands: marketData?.brands || [],
        prices: pricesData?.prices.slice(0, 20) || [],
      };

      const result = await analyzeBusinessData(
        data,
        'MobiMEA market position in Mauritius phone retail market'
      );

      setInsights(result);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedRequests = [
    'Show me a bar chart comparing average prices across brands',
    'Create a pie chart showing product count by brand',
    'Make a table of top 10 cheapest phones in stock',
    'Build a dashboard showing Honor vs competitors',
    'Show price distribution across all retailers',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-10 h-10" />
            <h1 className="text-4xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Generate custom visualizations and insights on-demand with AI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
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
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateTool}
                disabled={!request.trim() || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Tool
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateInsights}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                Generate Insights
              </button>
            </div>

            {/* Suggested Requests */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Suggested requests:</p>
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
              {/* Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
              </div>

              {/* Insights */}
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

              {/* Recommendations */}
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
                    <p className="text-xs text-gray-500 mt-1">
                      Generated: {tool.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {tool.type}
                    </span>
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
                </div>

                {/* Show Code */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Generated Code
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
                    <code>{tool.code}</code>
                  </pre>
                </details>

                {/* Note about implementation */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Next Step:</strong> Copy this code and add it to your codebase as a new
                    component. For production use, implement a sandboxed rendering system using
                    react-live or iframe for security.
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* How It Works */}
        {generatedTools.length === 0 && !insights && (
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Describe What You Need</h3>
                  <p className="text-sm">
                    Tell the AI what kind of visualization or analysis you want in plain English
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI Generates the Tool</h3>
                  <p className="text-sm">
                    Gemini analyzes your request and available data, then generates React +
                    TypeScript code
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Use or Customize</h3>
                  <p className="text-sm">
                    View the generated code, copy it to your codebase, or request modifications
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> This feature generates React component code that you can
                integrate into your dashboard. For security, generated code should be reviewed before
                deployment.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
