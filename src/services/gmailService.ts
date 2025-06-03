import { Email } from '../types';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    }>;
  };
  internalDate: string;
}

interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
}

class GmailService {
  private accessToken: string | null = null;
  // Replace this with your actual Gmail OAuth client ID from Google Cloud Console
  // Get it from: https://console.cloud.google.com/apis/credentials
  // Get it from: https://console.cloud.google.com/apis/credentials
  private readonly CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID || 'YOUR_GMAIL_CLIENT_ID';

  async initialize() {
    // Check if client ID is properly configured
    if (this.CLIENT_ID === 'YOUR_GMAIL_CLIENT_ID' || !this.CLIENT_ID) {
      throw new Error('Gmail Client ID not configured. Please set VITE_GMAIL_CLIENT_ID environment variable or update the CLIENT_ID in gmailService.ts');
    }

    // Load Google APIs
    if (!window.gapi) {
      await this.loadGoogleAPIs();
    }
    
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('auth2', () => {
        try {
          window.gapi.auth2.init({
            client_id: this.CLIENT_ID,
          });
          resolve();
        } catch (error) {
          console.error('Failed to initialize Google Auth:', error);
          reject(new Error('Failed to initialize Google Auth. Please check your client ID.'));
        }
      });
    });
  }

  private loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google APIs'));
      document.head.appendChild(script);
    });
  }

  async login(): Promise<void> {
    try {
      await this.initialize();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
      });
      
      this.accessToken = user.getAuthResponse().access_token;
      localStorage.setItem('gmail_access_token', this.accessToken);
    } catch (error: any) {
      console.error('Gmail authentication error:', error);
      if (error.error === 'popup_closed_by_user') {
        throw new Error('Authentication cancelled. Please try again.');
      } else if (error.error === 'invalid_client') {
        throw new Error('Gmail OAuth client not configured properly. Please check your Client ID setup.');
      } else {
        throw new Error('Failed to authenticate with Gmail. Please check your setup and try again.');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.accessToken = null;
      localStorage.removeItem('gmail_access_token');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  checkAuth(): boolean {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('gmail_access_token');
    }
    return !!this.accessToken;
  }

  private async makeGmailRequest(endpoint: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    return response.json();
  }

  private decodeBase64(data: string): string {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (error) {
      return '';
    }
  }

  private extractEmailBody(message: GmailMessage): string {
    // Try to get the body from different parts of the message
    const payload = message.payload;
    
    if (payload.body?.data) {
      return this.decodeBase64(payload.body.data);
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return this.decodeBase64(part.body.data);
        }
        
        // Check nested parts
        if (part.parts) {
          for (const nestedPart of part.parts) {
            if (nestedPart.mimeType === 'text/plain' && nestedPart.body?.data) {
              return this.decodeBase64(nestedPart.body.data);
            }
          }
        }
      }
    }
    
    return message.snippet || '';
  }

  async fetchRawEmails(): Promise<Email[]> {
    try {
      console.log('Fetching email list...');
      const listResponse: GmailListResponse = await this.makeGmailRequest('messages?maxResults=10&q=in:inbox');
      
      if (!listResponse.messages) {
        return [];
      }

      console.log(`Found ${listResponse.messages.length} emails`);
      const emails: Email[] = [];

      for (const messageRef of listResponse.messages) {
        try {
          const message: GmailMessage = await this.makeGmailRequest(`messages/${messageRef.id}`);
          
          const headers = message.payload.headers;
          const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
          const date = headers.find(h => h.name === 'Date')?.value || '';
          
          const body = this.extractEmailBody(message);
          
          const email: Email = {
            id: message.id,
            sender: from,
            subject: subject,
            snippet: message.snippet,
            body: body,
            category: 'Personal', // Will be updated by AI analysis
            summary: 'Processing...', // Will be updated by AI analysis  
            timestamp: this.formatDate(date),
            priority: 'medium', // Will be updated by AI analysis
            read: false // You can implement read status tracking
          };

          emails.push(email);
        } catch (error) {
          console.error(`Error fetching message ${messageRef.id}:`, error);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Legacy method for backwards compatibility - now uses fetchRawEmails + external AI analysis
  async fetchEmails(geminiService?: any): Promise<Email[]> {
    return this.fetchRawEmails();
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      }
    } catch {
      return 'Unknown time';
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  }
}

export const gmailService = new GmailService();
