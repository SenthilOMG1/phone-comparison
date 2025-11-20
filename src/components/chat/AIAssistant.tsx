import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Settings } from 'lucide-react';
import { ChatMessage } from '../../types/chat.types';
import { getGeminiService, initializeGeminiService } from '../../services/ai/gemini.service';
import { Phone, Comparison } from '../../types';

interface AIAssistantProps {
  phone1?: Phone;
  phone2?: Phone;
  comparison?: Comparison;
}

export function AIAssistant({ phone1, phone2, comparison }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: phone1 && phone2
          ? `Hi! I'm your AI assistant. I can help you understand the differences between the ${phone1.brand} ${phone1.model} and ${phone2.brand} ${phone2.model}. What would you like to know?`
          : "Hi! I'm your AI assistant. Select two phones to compare and I can help answer your questions.",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, phone1, phone2]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const geminiService = getGeminiService();
      const response = await geminiService.sendMessage(
        inputValue,
        messages,
        { phone1, phone2, comparison }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    initializeGeminiService(apiKey);
    setShowSettings(false);
  };

  const suggestedQuestions = [
    'Which phone has better battery life?',
    'What are the camera differences?',
    'Which is better for gaming?',
    'How do the prices compare?',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all z-50 flex items-center gap-2"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-400" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-neutral-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-primary-500 rounded transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full p-2 border border-neutral-300 rounded mb-2 text-sm"
              />
              <button
                onClick={handleSaveApiKey}
                className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors text-sm"
              >
                Save API Key
              </button>
              <p className="text-xs text-neutral-600 mt-2">
                Get your key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
              <p className="text-xs text-neutral-600 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="text-xs bg-white border border-neutral-300 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 p-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary-600 text-white p-2 rounded hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
