# AI Features - Dynamic Tool Generation

## 🎯 New Feature: AI Assistant for CEO

**Access:** http://localhost:5177/ai

### What It Does

The AI Assistant page allows the CEO to **generate custom visualizations and tools on-demand** using natural language requests. Gemini AI converts requests into React + TypeScript code.

---

## ✨ Features

### 1. **Dynamic Tool Generation**

CEO can request any visualization:
- "Show me a bar chart comparing Honor vs Samsung prices"
- "Create a pie chart of product distribution by brand"
- "Build a table of top 10 cheapest phones"
- "Make a dashboard showing market trends"

**How it works:**
1. CEO types natural language request
2. Gemini analyzes request + available data
3. Generates complete React component with Recharts
4. CEO can view code and copy to codebase

### 2. **AI Business Insights**

Click "Generate Insights" to get:
- **Executive Summary**: Market situation overview
- **Key Insights**: Market positioning, pricing, competition
- **Recommendations**: Actionable strategies for MobiMEA

**Example Output:**
```json
{
  "summary": "MobiMEA holds a strong position in the Mauritius market with Honor phones priced 12% below Samsung average, creating competitive advantage...",
  "insights": [
    "Honor's average price of MUR 28,500 is significantly lower than Samsung (MUR 45,000)",
    "High stock availability (100%) gives MobiMEA fulfillment advantage",
    "Price Guru and 361 show aggressive pricing on competitor brands"
  ],
  "recommendations": [
    "Emphasize price-value proposition in marketing campaigns",
    "Monitor Courts pricing weekly for early competitive response",
    "Consider bundle deals to increase average transaction value"
  ]
}
```

---

## 🔧 Technical Implementation

### Backend Integration

The AI Assistant uses:
```typescript
// src/services/ai/gemini.service.ts

// Generate custom visualizations
export async function generateInteractiveTool(
  request: string,
  availableData: any
): Promise<{
  code: string;
  type: 'chart' | 'table' | 'dashboard' | 'custom';
  title: string;
  description: string;
}>;

// Generate business insights
export async function analyzeBusinessData(
  data: any,
  context: string
): Promise<{
  insights: string[];
  recommendations: string[];
  summary: string;
}>;
```

### Available Data for Tool Generation

The system provides:
- Dashboard statistics (products, retailers, stock)
- Latest prices across all retailers
- Brand comparison data (Honor vs Samsung vs Xiaomi)
- Market trends and promotions

---

## 📊 Example Use Cases

### Use Case 1: Custom Price Comparison
**Request:** "Create a line chart showing price trends for Samsung Galaxy S24 vs Honor Magic 6"

**Generated:** React component with Recharts LineChart pulling data from price history API

### Use Case 2: Market Share Analysis
**Request:** "Show me a pie chart of market share by brand based on product count"

**Generated:** PieChart component with brand distribution visualization

### Use Case 3: Stock Dashboard
**Request:** "Build a dashboard showing in-stock vs out-of-stock products by retailer"

**Generated:** Multi-chart dashboard with bar charts and statistics

### Use Case 4: CEO Briefing
**Request:** Click "Generate Insights"

**Generated:** AI analysis with:
- Market position summary
- Competitive advantages
- Pricing strategies
- Growth opportunities

---

## 🚀 How to Use

### Step 1: Start Backend + Frontend

```bash
# Terminal 1: Backend
cd backend
python api/main.py

# Terminal 2: Frontend
npm run dev
```

### Step 2: Navigate to AI Assistant

Visit: http://localhost:5177/ai

### Step 3: Generate Tools

**Option A - Use Suggested Requests:**
Click any suggested request pill to auto-fill

**Option B - Custom Request:**
Type your own request like:
- "Make a comparison table of Honor vs Samsung features"
- "Show retailer price distribution as a box plot"
- "Create a heatmap of product availability"

### Step 4: Review Generated Code

- View the generated React component
- Copy code to clipboard
- Add to your codebase as needed

---

## 🔐 Security Notes

### Production Considerations

**Current Implementation:**
- Shows generated code for review
- CEO can copy and manually integrate

**For Production:**
```typescript
// Option 1: Use react-live for safe rendering
import { LiveProvider, LivePreview } from 'react-live';

// Option 2: Use sandboxed iframe
<iframe srcDoc={generatedHTML} sandbox="allow-scripts" />

// Option 3: Server-side validation
POST /api/ai/validate-tool
{
  "code": "...",
  "signature": "..."
}
```

**Best Practices:**
1. ✅ Review all generated code before deployment
2. ✅ Sanitize user inputs
3. ✅ Implement rate limiting
4. ✅ Log all tool generations for audit
5. ✅ Use CSP headers in production

---

## 💡 Advanced Features (Future)

### Live Rendering (Coming Soon)
```typescript
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

<LiveProvider code={tool.code} scope={{ recharts, lucideReact }}>
  <LivePreview />  {/* Renders component safely */}
  <LiveError />
</LiveProvider>
```

### Tool Persistence
- Save generated tools to database
- Share tools across team
- Version control for tool iterations

### Interactive Editing
- CEO can request modifications
- "Make the bars blue instead of green"
- "Add a filter for last 30 days"

### Scheduled Reports
- Auto-generate weekly insights
- Email CEO with AI analysis
- Track recommendations over time

---

## 📖 API Reference

### `generateInteractiveTool(request, data)`

Generates React component code from natural language.

**Parameters:**
- `request` (string): Natural language description
- `data` (object): Available data for visualization

**Returns:**
```typescript
{
  code: string;          // React component code
  type: 'chart' | 'table' | 'dashboard' | 'custom';
  title: string;         // Component title
  description: string;   // What it does
}
```

### `analyzeBusinessData(data, context)`

Generates CEO-level business insights.

**Parameters:**
- `data` (object): Dashboard and market data
- `context` (string): Business context description

**Returns:**
```typescript
{
  summary: string;              // Executive summary
  insights: string[];           // Key findings
  recommendations: string[];    // Action items
}
```

---

## 🎓 Example Outputs

### Generated Bar Chart Component

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: any;
}

export function BrandPriceComparison({ data }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Average Price by Brand
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `MUR ${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="avgPrice" fill="#3b82f6" name="Average Price" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Generated Insights

```json
{
  "summary": "MobiMEA's Honor product line shows strong competitive positioning in the Mauritius market, with prices averaging 15% below Samsung equivalents while maintaining full stock availability across all retailers.",
  "insights": [
    "Honor Magic 6 Pro priced at MUR 42,000 vs Samsung S24 Ultra at MUR 65,000 - 35% price advantage",
    "100% in-stock rate across 4 retailers compared to Samsung's 87%",
    "Price Guru consistently offers lowest prices (3-5% below Courts and Galaxy)"
  ],
  "recommendations": [
    "Launch targeted campaign highlighting Honor's flagship features at mid-range prices",
    "Negotiate exclusive color variants with suppliers to differentiate from competitors",
    "Implement price-match guarantee to counter aggressive Price Guru pricing"
  ]
}
```

---

## 🎉 Benefits

### For CEO
- ✅ **Instant Insights**: Get analysis without waiting for reports
- ✅ **Custom Views**: Generate exactly the visualization needed
- ✅ **Data-Driven Decisions**: AI-powered recommendations
- ✅ **No Coding Required**: Natural language interface

### For Business
- ✅ **Agility**: Respond quickly to market changes
- ✅ **Efficiency**: Automate routine analysis
- ✅ **Scalability**: Generate unlimited custom tools
- ✅ **Competitive Edge**: Faster insights than manual analysis

### For Development Team
- ✅ **Reduced Workload**: Less custom reporting requests
- ✅ **Code Examples**: Gemini generates clean, typed code
- ✅ **Consistency**: All tools follow same pattern
- ✅ **Documentation**: Self-documenting visualizations

---

## 📞 Support

**Questions about AI features?**
- Check generated code for implementation details
- Review `src/services/ai/gemini.service.ts` for API usage
- See `src/pages/AIAssistant/` for UI implementation

**Want to customize?**
- Modify prompts in `gemini.service.ts`
- Add new data sources in `AIAssistant.tsx`
- Extend visualization types in generation logic

---

**The AI Assistant transforms your CEO dashboard into an intelligent, adaptive analytics platform! 🚀**
