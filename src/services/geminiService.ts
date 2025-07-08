
import { GeminiAnalyzer } from './geminiAnalyzer';
import { GeminiReplyGenerator } from './geminiReply';
import { GeminiSearchEngine } from './geminiSearch';
import { EmailSummary, EmailContext } from '../types/gemini';
import { Task } from '../types';

export class GeminiService {
  private analyzer: GeminiAnalyzer;
  private replyGenerator: GeminiReplyGenerator;
  private searchEngine: GeminiSearchEngine;

  constructor(apiKey: string) {
    this.analyzer = new GeminiAnalyzer(apiKey);
    this.replyGenerator = new GeminiReplyGenerator(apiKey);
    this.searchEngine = new GeminiSearchEngine(apiKey);
  }

  async analyzeEmail(subject: string, body: string, sender: string): Promise<EmailSummary> {
    return this.analyzer.analyzeEmail(subject, body, sender);
  }

  async generateReply(originalEmail: { subject: string; body: string; sender: string }, context?: string): Promise<string> {
    return this.replyGenerator.generateReply(originalEmail, context);
  }

  async searchEmails(query: string, emailContext: EmailContext[]): Promise<string> {
    return this.searchEngine.searchEmails(query, emailContext);
  }

  async generateSmartSuggestions(emails: EmailContext[]): Promise<string[]> {
    return this.searchEngine.generateSmartSuggestions(emails);
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
