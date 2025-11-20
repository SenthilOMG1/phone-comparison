import { ChatMessage } from '../../types/chat.types';
import { Phone, Comparison } from '../../types';

export class GeminiService {
  private apiKey: string;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[],
    context?: { phone1?: Phone; phone2?: Phone; comparison?: Comparison },
    retries: number = 3
  ): Promise<string> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
      return 'Please configure your Gemini API key in the settings to use the AI assistant.';
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const systemContext = this.buildSystemContext(context);
        const conversationContext = this.buildConversationContext(conversationHistory);

        const fullPrompt = `${systemContext}

${conversationContext}

User: ${message}
Assistant:`;

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Gemini API] HTTP Error:', response.status, errorText);

          // Retry on 503 (overloaded) or 429 (rate limit)
          if ((response.status === 503 || response.status === 429) && attempt < retries - 1) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
            console.log(`[Gemini API] Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Gemini API] Full response:', JSON.stringify(data, null, 2));
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
          console.error('[Gemini API] No text in response. Data structure:', data);
          throw new Error('No response from Gemini API');
        }

        console.log('[Gemini API] Success! Response length:', aiResponse.length);
        return aiResponse;
      } catch (error) {
        if (attempt === retries - 1) {
          console.error('[Gemini API] All retries failed:', error);
          throw error;
        }
      }
    }

    return 'Sorry, I encountered an error while processing your request. Please try again.';
  }

  private buildSystemContext(context?: { phone1?: Phone; phone2?: Phone; comparison?: Comparison }): string {
    let systemPrompt = `You are an expert phone comparison assistant for MobiMEA, the official Honor phone importer in Mauritius.
Your role is to help sales staff and customers make informed decisions about Honor phones compared to competitors.

You should:
- Provide accurate, data-driven insights based on the comparison data
- Highlight Honor's strengths honestly while being fair about competitors
- Explain technical specs in simple terms for customers
- Help sales staff craft compelling pitches
- Be concise and focused on decision-making

`;

    if (context?.phone1 && context?.phone2) {
      systemPrompt += `\nCurrent Comparison Context:
Phone 1: ${context.phone1.brand} ${context.phone1.model}
- Price: ${context.phone1.pricing?.[0]?.currency} ${context.phone1.pricing?.[0]?.basePrice}
- Processor: ${context.phone1.specs.soc.family} ${context.phone1.specs.soc.model}
- Camera: ${context.phone1.specs.camera.main.megapixels}MP main
- Battery: ${context.phone1.specs.battery.capacityMah}mAh
- Display: ${context.phone1.specs.display.sizeInches}" ${context.phone1.specs.display.type}

Phone 2: ${context.phone2.brand} ${context.phone2.model}
- Price: ${context.phone2.pricing?.[0]?.currency} ${context.phone2.pricing?.[0]?.basePrice}
- Processor: ${context.phone2.specs.soc.family} ${context.phone2.specs.soc.model}
- Camera: ${context.phone2.specs.camera.main.megapixels}MP main
- Battery: ${context.phone2.specs.battery.capacityMah}mAh
- Display: ${context.phone2.specs.display.sizeInches}" ${context.phone2.specs.display.type}
`;

      if (context.comparison) {
        systemPrompt += `\nKey Differences: ${context.comparison.insights.highlights.slice(0, 3).map(h => h.title).join(', ')}`;
        systemPrompt += `\nTL;DR: ${context.comparison.insights.tldr.summary}`;
      }
    }

    return systemPrompt;
  }

  private buildConversationContext(conversationHistory: ChatMessage[]): string {
    if (conversationHistory.length === 0) {
      return '';
    }

    return conversationHistory
      .slice(-5)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }
}

export let geminiService: GeminiService | null = null;

export function initializeGeminiService(apiKey: string) {
  geminiService = new GeminiService(apiKey);
}

export function getGeminiService(): GeminiService {
  if (!geminiService) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || 'YOUR_GEMINI_API_KEY';
    geminiService = new GeminiService(apiKey);
  }
  return geminiService;
}

/**
 * Generate interactive tool code from natural language request
 * CEO can request custom visualizations on-the-fly
 */
export async function generateInteractiveTool(
  request: string,
  availableData: any
): Promise<{
  code: string;
  type: 'chart' | 'table' | 'dashboard' | 'custom';
  title: string;
  description: string;
}> {
  const service = getGeminiService();

  const prompt = `
You are a React + TypeScript code generator for business intelligence dashboards.

**User Request:** ${request}

**Available Data:**
${JSON.stringify(availableData, null, 2)}

**Task:** Generate a complete, ready-to-use React component that visualizes this data.

**Requirements:**
1. Return ONLY valid React + TypeScript component code
2. NO markdown code blocks, NO explanations
3. Use Recharts for charts (import { BarChart, LineChart, PieChart, etc. } from 'recharts')
4. Use Tailwind CSS for styling
5. Component must accept \`data\` prop
6. Make it professional and visually appealing
7. Include a title and any necessary labels

**Example Output Format:**
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: any;
}

export function GeneratedTool({ data }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chart Title</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

Generate the component now (code only, no markdown):
`;

  try {
    const code = await service.sendMessage(prompt, []);

    // Determine tool type
    let type: 'chart' | 'table' | 'dashboard' | 'custom' = 'custom';
    if (code.includes('Chart')) type = 'chart';
    else if (code.includes('<table') || code.includes('Table')) type = 'table';
    else if (code.includes('Dashboard')) type = 'dashboard';

    // Extract title
    const titleMatch = code.match(/<h[12][^>]*>([^<]+)<\/h[12]>/);
    const title = titleMatch ? titleMatch[1].replace(/["']/g, '') : 'Generated Tool';

    return {
      code,
      type,
      title,
      description: `Interactive ${type} generated for: ${request}`
    };
  } catch (error) {
    console.error('Failed to generate tool:', error);
    throw new Error('Failed to generate interactive tool');
  }
}

/**
 * Analyze business data and provide CEO insights
 */
export async function analyzeBusinessData(
  data: any,
  context: string
): Promise<{
  insights: string[];
  recommendations: string[];
  summary: string;
}> {
  const service = getGeminiService();

  // Summarize data to reduce tokens
  const dataSummary = {
    brands: data.brands?.slice(0, 5),
    stats: data.stats
  };

  const prompt = `Analyze phone market data for MobiMEA (Mauritius retailer).

Context: ${context}
Data: ${JSON.stringify(dataSummary)}

Return JSON only:
{
  "summary": "Executive summary paragraph",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["action 1", "action 2", "action 3"]
}

Focus on Honor phones, pricing, and actionable strategies.`;

  try {
    let response = await service.sendMessage(prompt, []);

    // Remove markdown if present
    if (response.includes('```')) {
      const match = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
      if (match) {
        response = match[1];
      }
    }

    return JSON.parse(response.trim());
  } catch (error) {
    console.error('Failed to analyze data:', error);
    return {
      summary: 'Unable to generate analysis at this time.',
      insights: [],
      recommendations: []
    };
  }
}

/**
 * Intelligent AI Assistant - Decides whether to chat or generate visualization
 * Returns either text response or chart configuration
 */
export async function handleAIRequest(
  message: string,
  conversationHistory: any[],
  availableData: { brands: any[]; products: any[]; stats: any }
): Promise<{
  type: 'chat' | 'chart' | 'insights';
  data: any;
}> {
  const service = getGeminiService();

  // Check if user wants a visualization
  const visualizationKeywords = ['show', 'display', 'create', 'generate', 'chart', 'graph', 'plot', 'visualize', 'pie', 'bar', 'line', 'scatter', 'radar'];
  const wantsVisualization = visualizationKeywords.some(keyword => message.toLowerCase().includes(keyword));

  // Check if user wants business insights
  const insightKeywords = ['analyze', 'insights', 'recommendations', 'strategy', 'competitive', 'market analysis'];
  const wantsInsights = insightKeywords.some(keyword => message.toLowerCase().includes(keyword));

  if (wantsVisualization) {
    // Generate chart
    const chartConfig = await generateEChartsConfig(message, availableData);
    return {
      type: 'chart',
      data: chartConfig
    };
  } else if (wantsInsights) {
    // Generate business insights
    const insights = await analyzeBusinessData(availableData, message);
    return {
      type: 'insights',
      data: insights
    };
  } else {
    // Normal chat conversation
    const response = await service.sendMessage(message, conversationHistory, {});
    return {
      type: 'chat',
      data: { message: response }
    };
  }
}

/**
 * Generate complete ECharts configuration using Gemini AI
 * Gemini creates the entire chart from scratch based on the request
 */
export async function generateEChartsConfig(
  request: string,
  availableData: { brands: any[]; products: any[]; stats: any }
): Promise<{
  chartOption: any;
  title: string;
  code: string;
}> {
  const service = getGeminiService();

  // Summarize data to reduce token count
  const dataSummary = {
    brands: availableData.brands?.slice(0, 5).map(b => ({ brand: b.brand, price: b.avg_price, count: b.product_count })) || [],
    products: availableData.products?.slice(0, 6).map(p => ({ name: p.product_name, price: p.price, brand: p.brand })) || []
  };

  // Detect specific chart type from request
  const requestLower = request.toLowerCase();
  let chartTypeHint = 'bar';
  if (requestLower.includes('pie') || requestLower.includes('donut')) chartTypeHint = 'pie';
  else if (requestLower.includes('line') || requestLower.includes('trend')) chartTypeHint = 'line';
  else if (requestLower.includes('scatter')) chartTypeHint = 'scatter';
  else if (requestLower.includes('radar')) chartTypeHint = 'radar';

  const prompt = `Create ECharts config for: "${request}"

Data: ${JSON.stringify(dataSummary)}

IMPORTANT: User wants a ${chartTypeHint.toUpperCase()} chart. Must use type: "${chartTypeHint}"

Return JSON:
{
  "title": "descriptive title",
  "chartOption": {
    "title": {"text": "Title", "left": "center", "textStyle": {"color": "#fff", "fontSize": 18}},
    "tooltip": {"trigger": "${chartTypeHint === 'pie' ? 'item' : 'axis'}", "show": true, "backgroundColor": "rgba(0,0,0,0.8)", "textStyle": {"color": "#fff"}},
    "legend": {"show": true, "textStyle": {"color": "#a78bfa"}, "bottom": 10},
    ${chartTypeHint === 'pie' ?
      `"series": [{"type": "pie", "radius": ["40%", "70%"], "data": [...], "label": {"color": "#fff"}, "emphasis": {"itemStyle": {"shadowBlur": 10}}}]` :
      `"xAxis": {"type": "category", "data": [...], "axisLabel": {"color": "#a78bfa"}},
    "yAxis": {"type": "value", "axisLabel": {"color": "#a78bfa"}},
    "series": [{"type": "${chartTypeHint}", "data": [...], "smooth": true, "itemStyle": {"color": "#8b5cf6"}}]`}
  },
  "code": "// code"
}

Dark theme. Interactive tooltips. Smooth animations. Use ALL data provided.`;

  try {
    let response = await service.sendMessage(prompt, []);
    console.log('[Gemini] Raw response:', response);

    // Remove markdown if present
    if (response.includes('```')) {
      const match = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
      if (match) {
        response = match[1];
      }
    }

    console.log('[Gemini] Cleaned response:', response);
    const parsed = JSON.parse(response.trim());
    console.log('[Gemini] Parsed successfully:', parsed);

    return {
      chartOption: parsed.chartOption || {},
      title: parsed.title || 'Data Visualization',
      code: parsed.code || '// Chart code'
    };
  } catch (error) {
    console.error('[Gemini] Failed to generate ECharts config:', error);
    // Fallback to simple bar chart
    return {
      title: 'Data Visualization',
      chartOption: {
        title: { text: 'Data Overview', left: 'center', textStyle: { color: '#fff' } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: availableData.brands.map(b => b.brand), axisLabel: { color: '#a78bfa' } },
        yAxis: { type: 'value', axisLabel: { color: '#a78bfa' } },
        series: [{ data: availableData.brands.map(b => b.avg_price), type: 'bar' }]
      },
      code: '// Generated chart code'
    };
  }
}
