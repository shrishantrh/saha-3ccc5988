
import { GeminiApi } from './geminiApi';
import { GeminiMessage, EmailContext } from '../types/gemini';

export class GeminiSearchEngine {
  private api: GeminiApi;

  constructor(apiKey: string) {
    this.api = new GeminiApi(apiKey);
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

      const response = await this.api.makeRequest(messages);
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
      
      const response = await this.api.makeRequest(messages);
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
