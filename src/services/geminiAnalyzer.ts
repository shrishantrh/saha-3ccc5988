
import { GeminiApi } from './geminiApi';
import { GeminiMessage, EmailSummary } from '../types/gemini';

export class GeminiAnalyzer {
  private api: GeminiApi;

  constructor(apiKey: string) {
    this.api = new GeminiApi(apiKey);
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
      const response = await this.api.makeRequest(messages);
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
}
