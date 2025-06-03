
interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

interface EmailSummary {
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

interface EmailContext {
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

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(messages: GeminiMessage[], maxRetries: number = 2): Promise<string> {
    console.log('Making Gemini API request with', messages.length, 'messages');
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages.map(msg => ({
              role: msg.role,
              parts: msg.parts
            })),
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000,
            },
          }),
        });

        console.log(`Gemini API response status (attempt ${attempt}):`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini API error response:', errorText);
          
          if (response.status === 429 && attempt <= maxRetries) {
            console.log(`Rate limit hit, retrying in 2s (attempt ${attempt}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data: GeminiResponse = await response.json();
        console.log('Gemini API response data received successfully');
        return data.candidates[0]?.content?.parts[0]?.text || '';
        
      } catch (error) {
        if (attempt === maxRetries + 1) {
          throw error;
        }
        
        console.log(`Request failed on attempt ${attempt}, will retry:`, error);
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  async analyzeEmail(subject: string, body: string, sender: string): Promise<EmailSummary> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const prompt = `Analyze this email and provide a detailed JSON response. Be very accurate with priorities and deadlines.

Email details:
Subject: ${subject}
From: ${sender}
Body: ${body}
Today's date: ${todayStr}

Provide JSON with this exact structure:
{
  "summary": "Brief 1-2 sentence summary",
  "category": "One of: Academic, Admissions, Events, Personal, Work, Finance, Travel, Shopping, Social, Health, Legal, Technology",
  "priority": "low/medium/high - be conservative, only high if truly urgent",
  "sentiment": "positive/neutral/negative",
  "urgency": 1-10,
  "actionRequired": true/false,
  "estimatedResponseTime": "within 1 hour/within 1 day/within 1 week/no response needed",
  "tasks": [
    {
      "title": "Specific actionable task",
      "dueDate": "YYYY-MM-DD - be realistic based on email content",
      "priority": "low/medium/high"
    }
  ]
}

Rules for task extraction:
- Only extract clear, actionable tasks
- Set realistic deadlines based on email content
- If email mentions "by Friday" and today is Tuesday, set deadline to that Friday
- If no deadline mentioned, estimate reasonably (urgent: 2-3 days, normal: 1 week)
- If no tasks, return empty array

Respond only with valid JSON.`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      const response = await this.makeRequest(messages);
      console.log('Gemini analysis response:', response);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        summary: analysis.summary || 'No summary available',
        category: analysis.category || 'Personal',
        priority: ['low', 'medium', 'high'].includes(analysis.priority) ? analysis.priority : 'medium',
        sentiment: ['positive', 'neutral', 'negative'].includes(analysis.sentiment) ? analysis.sentiment : 'neutral',
        urgency: typeof analysis.urgency === 'number' ? Math.max(1, Math.min(10, analysis.urgency)) : 5,
        actionRequired: Boolean(analysis.actionRequired),
        estimatedResponseTime: analysis.estimatedResponseTime || 'within 1 week',
        tasks: Array.isArray(analysis.tasks) ? analysis.tasks.filter((task: any) => 
          task.title && task.dueDate && task.priority
        ) : []
      };
    } catch (error) {
      console.error('Error analyzing email with Gemini:', error);
      return {
        summary: 'Unable to generate summary at this time',
        category: 'Personal',
        priority: 'medium',
        sentiment: 'neutral',
        urgency: 5,
        actionRequired: false,
        estimatedResponseTime: 'within 1 week',
        tasks: []
      };
    }
  }

  async generateReply(originalEmail: { subject: string; body: string; sender: string }, context?: string): Promise<string> {
    const prompt = `Generate a professional, helpful email reply. Be concise but warm.

Original Email:
Subject: ${originalEmail.subject}
From: ${originalEmail.sender}
Body: ${originalEmail.body}

${context ? `Additional context: ${context}` : ''}

Write a professional reply that addresses the main points of the email. Keep it concise and appropriate.`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      return await this.makeRequest(messages);
    } catch (error) {
      console.error('Error generating reply with Gemini:', error);
      return 'Thank you for your email. I will review it and get back to you soon.';
    }
  }

  async searchEmails(query: string, emailContext: EmailContext[]): Promise<string> {
    console.log('searchEmails called with query:', query);
    console.log('Email context length:', emailContext.length);

    try {
      const limitedContext = emailContext.slice(0, 15);
      
      const contextString = limitedContext.map((email, index) => {
        const tasksString = email.tasks.length > 0 
          ? `\n  Tasks: ${email.tasks.map(task => `"${task.title}" (due: ${task.dueDate}, priority: ${task.priority})`).join(', ')}`
          : '';
        
        const sentimentString = email.sentiment ? `\n  Sentiment: ${email.sentiment}` : '';
        const urgencyString = email.urgency ? `\n  Urgency: ${email.urgency}/10` : '';
        
        return `${index + 1}. Subject: "${email.subject}"
   From: ${email.sender}
   Time: ${email.timestamp}
   Category: ${email.category}
   Priority: ${email.priority}${sentimentString}${urgencyString}
   Summary: ${email.summary}${tasksString}`;
      }).join('\n\n');

      const prompt = `You are an intelligent email assistant. Answer the user's question based on their email data.

User Question: "${query}"

Available Emails (${limitedContext.length} most recent):
${contextString}

Provide a helpful, conversational answer. Be specific and reference relevant emails. If asking about tasks, include deadlines and priorities. If no relevant information is found, say so politely.`;

      const messages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];

      const response = await this.makeRequest(messages);
      return response;
    } catch (error) {
      console.error('Error in searchEmails method:', error);
      throw error;
    }
  }

  async generateSmartSuggestions(emails: EmailContext[]): Promise<string[]> {
    const recentEmails = emails.slice(0, 5);
    const prompt = `Based on these recent emails, suggest 3-4 helpful questions the user might want to ask:

${recentEmails.map(email => `- ${email.subject} (from ${email.sender}, ${email.category})`).join('\n')}

Generate practical questions like:
- "What are my upcoming deadlines?"
- "Show me high priority emails"
- "What tasks do I need to complete this week?"

Return as a JSON array of strings.`;

    try {
      const messages: GeminiMessage[] = [
        { role: 'user', parts: [{ text: prompt }] }
      ];
      
      const response = await this.makeRequest(messages);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [
        "What are my upcoming deadlines?",
        "Show me high priority emails",
        "What tasks need attention?"
      ];
    } catch (error) {
      return [
        "What are my upcoming deadlines?",
        "Show me high priority emails", 
        "What tasks need attention?"
      ];
    }
  }
}

export const geminiService = {
  create: (apiKey: string) => new GeminiService(apiKey),
  
  validateApiKey: async (apiKey: string): Promise<boolean> => {
    try {
      const service = new GeminiService(apiKey);
      await service.analyzeEmail('Test', 'This is a test email', 'test@example.com');
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
};
