
export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  category: string;
  summary: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  aiAnalysis?: {
    summary: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    tasks: Array<{
      title: string;
      dueDate: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    sentiment?: 'positive' | 'neutral' | 'negative';
    urgency?: number;
    actionRequired?: boolean;
    estimatedResponseTime?: string;
  };
}

export interface Task {
  id: string;
  emailId: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  daysLeft: number;
}

export interface GmailAuth {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
