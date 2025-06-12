
import { GeminiAnalyzer } from './geminiAnalyzer';
import { GeminiReplyGenerator } from './geminiReply';
import { GeminiSearchEngine } from './geminiSearch';
import { GeminiCalendarService } from './geminiCalendar';
import { EmailSummary, EmailContext } from '../types/gemini';
import { CalendarInsight } from '../types/calendar';
import { Task } from '../types';

export class GeminiService {
  private analyzer: GeminiAnalyzer;
  private replyGenerator: GeminiReplyGenerator;
  private searchEngine: GeminiSearchEngine;
  private calendarService: GeminiCalendarService;

  constructor(apiKey: string) {
    this.analyzer = new GeminiAnalyzer(apiKey);
    this.replyGenerator = new GeminiReplyGenerator(apiKey);
    this.searchEngine = new GeminiSearchEngine(apiKey);
    this.calendarService = new GeminiCalendarService(apiKey);
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

  async generateCalendarSuggestions(freeTimeMessage: string, tasks: Task[], insights: CalendarInsight): Promise<string> {
    return this.calendarService.generateCalendarSuggestions(freeTimeMessage, tasks, insights);
  }

  async breakDownTask(taskTitle: string, timeframe: 'days' | 'weeks' | 'hours', availableTimeSlots: { start: Date; end: Date; duration: number }[]): Promise<{ subtasks: Array<{ title: string; duration: number; priority: string }>, schedule: Array<{ subtask: string; timeSlot: string }> }> {
    return this.calendarService.breakDownTask(taskTitle, timeframe, availableTimeSlots);
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
