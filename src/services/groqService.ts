interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
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
}

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(messages: GroqMessage[]): Promise<string> {
    console.log('Making Groq API request with', messages.length, 'messages');
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error response:', error);
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data: GroqResponse = await response.json();
    console.log('Groq API response data received');
    return data.choices[0]?.message?.content || '';
  }

  async analyzeEmail(subject: string, body: string, sender: string): Promise<EmailSummary> {
    const prompt = `Analyze this email and provide a JSON response with the following structure:
{
  "summary": "Brief 1-2 sentence summary of the email",
  "category": "One of: Academic, Admissions, Events, Personal, Work, Finance, Travel, Shopping, Social",
  "priority": "low, medium, or high based on urgency and importance",
  "tasks": [
    {
      "title": "Actionable task extracted from email",
      "dueDate": "YYYY-MM-DD format (estimate based on context, default to 7 days from now if unclear)",
      "priority": "low, medium, or high"
    }
  ]
}

Email details:
Subject: ${subject}
From: ${sender}
Body: ${body}

Only extract tasks that are clearly actionable (deadlines, meetings, responses needed, etc.). If no clear tasks, return empty array. Respond only with valid JSON.`;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are an AI assistant that analyzes emails and extracts summaries, categories, priorities, and actionable tasks. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await this.makeRequest(messages);
      console.log('Groq API response:', response);
      
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and format the response
      return {
        summary: analysis.summary || 'No summary available',
        category: analysis.category || 'Personal',
        priority: ['low', 'medium', 'high'].includes(analysis.priority) ? analysis.priority : 'medium',
        tasks: Array.isArray(analysis.tasks) ? analysis.tasks.filter((task: any) => 
          task.title && task.dueDate && task.priority
        ) : []
      };
    } catch (error) {
      console.error('Error analyzing email with Groq:', error);
      // Fallback response
      return {
        summary: 'Unable to generate summary at this time',
        category: 'Personal',
        priority: 'medium',
        tasks: []
      };
    }
  }

  async generateReply(originalEmail: { subject: string; body: string; sender: string }, context?: string): Promise<string> {
    const prompt = `Generate a professional email reply to the following email. ${context ? `Context: ${context}` : ''}

Original Email:
Subject: ${originalEmail.subject}
From: ${originalEmail.sender}
Body: ${originalEmail.body}

Generate a helpful, professional reply. Keep it concise and appropriate to the context.`;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are a professional email assistant. Generate helpful, polite, and contextually appropriate email replies.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      return await this.makeRequest(messages);
    } catch (error) {
      console.error('Error generating reply with Groq:', error);
      return 'Thank you for your email. I will review it and get back to you soon.';
    }
  }

  async searchEmails(query: string, emailContext: EmailContext[]): Promise<string> {
    console.log('searchEmails called with query:', query);
    console.log('Email context length:', emailContext.length);

    try {
      // Limit context to prevent API issues
      const limitedContext = emailContext.slice(0, 15);
      
      const contextString = limitedContext.map((email, index) => {
        const tasksString = email.tasks.length > 0 
          ? `\n  Tasks: ${email.tasks.map(task => `"${task.title}" (due: ${task.dueDate}, priority: ${task.priority})`).join(', ')}`
          : '';
        
        return `${index + 1}. Subject: "${email.subject}"
   From: ${email.sender}
   Time: ${email.timestamp}
   Category: ${email.category}
   Priority: ${email.priority}
   Summary: ${email.summary}${tasksString}`;
      }).join('\n\n');

      console.log('Context string length:', contextString.length);

      // Ensure the prompt isn't too long
      const prompt = `You are an AI assistant that helps users find information from their emails. Based on the user's question and the email context provided, give a helpful and accurate answer.

User's question: "${query}"

Email context (${limitedContext.length} emails):
${contextString}

Please provide a helpful answer based on the available email information. If you can't find relevant information in the emails, let the user know. Be specific and reference the emails when possible.`;

      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that searches through email data to answer user questions. Be conversational, helpful, and specific in your responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      console.log('Making API request...');
      const response = await this.makeRequest(messages);
      console.log('API request successful, response length:', response.length);
      
      return response;
    } catch (error) {
      console.error('Error in searchEmails method:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error; // Re-throw to be handled by the calling code
    }
  }
}

export const groqService = {
  create: (apiKey: string) => new GroqService(apiKey),
  
  validateApiKey: async (apiKey: string): Promise<boolean> => {
    try {
      const service = new GroqService(apiKey);
      await service.analyzeEmail('Test', 'This is a test email', 'test@example.com');
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
};
