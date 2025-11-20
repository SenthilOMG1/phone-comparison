export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context?: {
    phone1Id?: string;
    phone2Id?: string;
    comparisonData?: any;
  };
}
