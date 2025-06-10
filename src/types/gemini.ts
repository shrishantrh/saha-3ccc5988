
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export interface EmailSummary {
  summary: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tasks: Array<{
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: number; // 1-10 scale
  actionRequired: boolean;
  estimatedResponseTime: string;
}

export interface EmailContext {
  subject: string;
  sender: string;
  timestamp: string;
  snippet: string;
  category: string;
  priority: string;
  summary: string;
  tasks: Array<{
    title: string;
    dueDate: string;
    priority: string;
  }>;
  sentiment?: string;
  urgency?: number;
}
