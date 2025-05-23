
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
