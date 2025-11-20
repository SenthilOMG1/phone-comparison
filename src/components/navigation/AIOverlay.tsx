import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getBrandComparison, getLatestPrices } from '../../services/api';
import { X, Sparkles, Loader2, Send, Copy, Check, Code, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { handleAIRequest } from '../../services/ai/gemini.service';

interface AIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'chat' | 'chart' | 'insights';
  data?: any;
  timestamp: Date;
}

export function AIOverlay({ isOpen, onClose }: AIOverlayProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<string | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all available data
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: marketData } = useQuery({
    queryKey: ['brandComparison'],
    queryFn: getBrandComparison,
  });

  const { data: productsData } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: () => getLatestPrices(),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m your AI assistant powered by Gemini. I can help you:\n\n• **Chat** about phones, pricing, and market data\n• **Generate charts** - just ask! (e.g., "Show price comparison")\n• **Analyze data** for business insights\n\nWhat would you like to know?',
        type: 'chat',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const availableData = {
        brands: marketData?.brands || [],
        products: productsData?.prices || [],
        stats: dashboardData || {}
      };

      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call intelligent AI handler
      const response = await handleAIRequest(input, conversationHistory, availableData);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.type === 'chat' ? response.data.message :
                 response.type === 'chart' ? response.data.title :
                 'Here are the insights based on your request:',
        type: response.type,
        data: response.data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'chat',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (messageId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(messageId);
    setTimeout(() => setCopied(null), 2000);
  };

  const suggestedPrompts = [
    'What are the top 3 budget phones?',
    'Show price comparison chart',
    'Analyze Honor market position',
    'Create pie chart of brands',
    'Which phone has best battery?',
    'Compare Samsung vs Xiaomi prices'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-5xl max-h-full overflow-hidden rounded-2xl pointer-events-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl border border-purple-500/20">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                      <p className="text-sm text-purple-300">Powered by Gemini AI</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10'} rounded-xl p-4`}>
                        {/* Text content */}
                        <p className="text-white whitespace-pre-wrap">{message.content}</p>

                        {/* Chart visualization */}
                        {message.type === 'chart' && message.data && (
                          <div className="mt-4 space-y-3">
                            <div
                              className="bg-slate-950 rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group relative"
                              onClick={() => setFullscreenChart(message.data)}
                            >
                              <ReactECharts
                                option={message.data.chartOption}
                                style={{ height: 500 }}
                                theme="dark"
                              />
                              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                                  <Maximize2 className="w-3 h-3" />
                                  Click to fullscreen
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setFullscreenChart(message.data)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs text-white flex items-center gap-2 transition-colors"
                              >
                                <Maximize2 className="w-3 h-3" />
                                Fullscreen
                              </button>
                              <button
                                onClick={() => setShowCode(showCode === message.id ? null : message.id)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white flex items-center gap-2 transition-colors"
                              >
                                <Code className="w-3 h-3" />
                                {showCode === message.id ? 'Hide' : 'Show'} Code
                              </button>
                              <button
                                onClick={() => handleCopy(message.id, message.data.code)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white flex items-center gap-2 transition-colors"
                              >
                                {copied === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied === message.id ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            {showCode === message.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-xs text-purple-200">
                                  <code>{message.data.code}</code>
                                </pre>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Business insights */}
                        {message.type === 'insights' && message.data && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-purple-300 mb-2">Executive Summary</h4>
                              <p className="text-sm text-white/80">{message.data.summary}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-purple-300 mb-2">Key Insights</h4>
                              <ul className="space-y-1">
                                {message.data.insights.map((insight: string, i: number) => (
                                  <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                    <span className="text-purple-400">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-purple-300 mb-2">Recommendations</h4>
                              <ul className="space-y-1">
                                {message.data.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                    <span className="text-green-400">→</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-white/40 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading indicator */}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <span className="text-white/60 text-sm">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested prompts */}
                {messages.length === 1 && !isGenerating && (
                  <div className="px-6 pb-4">
                    <p className="text-xs text-purple-300 mb-2">Try asking:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setInput(prompt)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-purple-200 transition-all text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask anything... charts, insights, or just chat!"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={handleSend}
                      disabled={isGenerating || !input.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-purple-300 mt-2 text-center">
                    Press Enter to send • Powered by Gemini 2.5 Flash
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fullscreen Chart Modal */}
          <AnimatePresence>
            {fullscreenChart && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFullscreenChart(null)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-8 z-[61] flex items-center justify-center pointer-events-none"
                >
                  <div className="w-full h-full max-w-7xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 pointer-events-auto overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h3 className="text-2xl font-bold text-white">{fullscreenChart.title}</h3>
                        <button
                          onClick={() => setFullscreenChart(null)}
                          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      {/* Chart */}
                      <div className="flex-1 p-8">
                        <div className="h-full bg-slate-950/50 rounded-lg p-6">
                          <ReactECharts
                            option={fullscreenChart.chartOption}
                            style={{ height: '100%', minHeight: 600 }}
                            theme="dark"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
