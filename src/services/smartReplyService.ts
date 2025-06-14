
import { GeminiService } from './geminiService';

export class SmartReplyService {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  async generateSmartReplies(email: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<string[]> {
    try {
      const prompt = `Generate 3 professional, contextually appropriate quick reply suggestions for this email. Make them concise (1-2 sentences each) and cover different response types (positive, neutral, request for more info).

Email:
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}

Return ONLY the 3 suggestions, one per line, without numbering or bullets.`;

      const response = await this.geminiService.generateReply(email, prompt);
      
      // Split response into individual suggestions and clean them up
      const suggestions = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.trim())
        .slice(0, 3);

      return suggestions.length > 0 ? suggestions : [
        "Thank you for your email. I'll review this and get back to you soon.",
        "I appreciate you reaching out. Let me look into this and respond shortly.",
        "Thanks for the information. Could you provide more details about this?"
      ];
    } catch (error) {
      console.error('Error generating smart replies:', error);
      return [
        "Thank you for your email. I'll review this and get back to you soon.",
        "I appreciate you reaching out. Let me look into this and respond shortly.",
        "Thanks for the information. Could you provide more details about this?"
      ];
    }
  }
}
