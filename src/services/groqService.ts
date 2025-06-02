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

interface RateLimitError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private extractRetryDelay(errorMessage: string): number {
    // Extract retry delay from error message like "Please try again in 39.243s"
    const retryMatch = errorMessage.match(/try again in ([\d.]+)s/);
    if (retryMatch) {
      const seconds = parseFloat(retryMatch[1]);
      return Math.ceil(seconds * 1000); // Convert to milliseconds and round up
    }
    return 30000; // Default to 30 seconds if we can't parse
  }

  private async makeRequest(messages: GroqMessage[], maxRetries: number = 2): Promise<string> {
    console.log('Making Groq API request with', messages.length, 'messages');
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
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

        console.log(`Groq API response status (attempt ${attempt}):`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Groq API error response:', errorText);
          
          // Handle rate limit specifically
          if (response.status === 429) {
            try {
              const errorData: RateLimitError = JSON.parse(errorText);
              const isRateLimit = errorData.error?.code === 'rate_limit_exceeded';
              
              if (isRateLimit && attempt <= maxRetries) {
                const retryDelay = this.extractRetryDelay(errorData.error.message);
                console.log(`Rate limit hit, retrying in ${retryDelay}ms (attempt ${attempt}/${maxRetries + 1})`);
                
                // Wait for the specified delay
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue; // Retry the request
              }
            } catch (parseError) {
              console.error('Failed to parse rate limit error:', parseError);
            }
          }
          
          throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data: GroqResponse = await response.json();
        console.log('Groq API response data received successfully');
        return data.choices[0]?.message?.content || '';
        
      } catch (error) {
        if (attempt === maxRetries + 1) {
          // This was our last attempt, throw the error
          throw error;
        }
        
        console.log(`Request failed on attempt ${attempt}, will retry:`, error);
        
        // For non-rate-limit errors, wait a shorter time before retry
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error('All retry attempts failed');
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
      // Limit context to prevent API issues - reduce further for rate limits
      const limitedContext = emailContext.slice(0, 10);
      
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

      // Keep prompt shorter to avoid hitting rate limits
      const prompt = `Based on the user's question and email context, provide a helpful answer.

Question: "${query}"

Emails (${limitedContext.length} most recent):
${contextString}

Answer based on the available information. Be specific and reference emails when possible.`;

      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that searches email data to answer questions. Be conversational and specific.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      console.log('Making API request with retry logic...');
      const response = await this.makeRequest(messages);
      console.log('API request successful, response length:', response.length);
      
      return response;
    } catch (error) {
      console.error('Error in searchEmails method:', error);
      
      // Check if it's still a rate limit error after retries
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }
      
      throw error;
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
