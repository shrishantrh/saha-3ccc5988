
import { GeminiApi } from './geminiApi';
import { GeminiMessage } from '../types/gemini';

export class GeminiReplyGenerator {
  private api: GeminiApi;

  constructor(apiKey: string) {
    this.api = new GeminiApi(apiKey);
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
      return await this.api.makeRequest(messages);
    } catch (error) {
      console.error('Error generating reply with Gemini:', error);
      return 'Thank you for your email. I will review it and get back to you soon.';
    }
  }
}
