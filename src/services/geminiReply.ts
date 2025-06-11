
import { GeminiApi } from './geminiApi';
import { GeminiMessage } from '../types/gemini';

export class GeminiReplyGenerator {
  private api: GeminiApi;

  constructor(apiKey: string) {
    this.api = new GeminiApi(apiKey);
  }

  async generateReply(originalEmail: { subject: string; body: string; sender: string }, context?: string): Promise<string> {
    const prompt = `Generate a professional, helpful email reply. Be concise but warm and friendly.

Original Email:
Subject: ${originalEmail.subject}
From: ${originalEmail.sender}
Body: ${originalEmail.body}

${context ? `Additional context: ${context}` : ''}

Guidelines:
- Keep the reply professional yet warm
- Address the main points of the email
- Be concise (2-3 sentences maximum)
- Use appropriate email etiquette
- Don't make commitments you can't keep
- If it's a question, provide a helpful response
- If it's informational, acknowledge appropriately

Write only the email body text, no subject line or signatures.`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      const reply = await this.api.makeRequest(messages);
      return reply.trim();
    } catch (error) {
      console.error('Error generating reply with Gemini:', error);
      return 'Thank you for your email. I will review it and get back to you soon.';
    }
  }

  async generateAutoReplyReadyTask(email: { subject: string; body: string; sender: string }): Promise<{ shouldCreateTask: boolean; taskTitle?: string; replyText?: string }> {
    const prompt = `Analyze this email and determine if it's suitable for an auto-reply ready task.

Email:
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}

Criteria for auto-reply ready:
- Email has positive or neutral sentiment
- Doesn't require complex decision making
- Is informational, confirmational, or a simple thank you
- Low urgency (routine communication)
- Can be acknowledged with a brief, professional response

If suitable, provide:
1. A task title for preparing the auto-reply
2. A suggested short reply text

Respond with JSON:
{
  "shouldCreateTask": true/false,
  "taskTitle": "Task description if applicable",
  "replyText": "Suggested reply if applicable"
}`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      const response = await this.api.makeRequest(messages);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { shouldCreateTask: false };
      }
      
      const result = JSON.parse(jsonMatch[0]);
      return {
        shouldCreateTask: Boolean(result.shouldCreateTask),
        taskTitle: result.taskTitle || undefined,
        replyText: result.replyText || undefined
      };
    } catch (error) {
      console.error('Error generating auto-reply task with Gemini:', error);
      return { shouldCreateTask: false };
    }
  }
}
