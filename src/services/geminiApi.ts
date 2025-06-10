
import { GeminiMessage, GeminiResponse } from '../types/gemini';

export class GeminiApi {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async makeRequest(messages: GeminiMessage[], maxRetries: number = 2): Promise<string> {
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
}
