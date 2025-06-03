import { Email } from "../types";
import { GeminiService } from "./geminiService";

// Scope for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];

// Google OAuth client ID - this should be obtained from Google Cloud Console
const CLIENT_ID = '881935451747-qhc9n0jtlpe206rb2ri50kaajsl196hp.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin;

export const gmailService = {
  // Initiate Google OAuth login
  login: () => {
    // Create OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', SCOPES.join(' '));
    
    // Redirect to Google login
    window.location.href = authUrl.toString();
  },
  
  // Check if we have a valid auth token
  checkAuth: (): boolean => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('gmail_token', token);
      localStorage.setItem('gmail_token_expiry', 
        (Date.now() + (parseInt(expiresIn || '0') * 1000)).toString());
      // Remove hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    
    // Check if token exists and is not expired
    const storedToken = localStorage.getItem('gmail_token');
    const tokenExpiry = localStorage.getItem('gmail_token_expiry');
    
    if (storedToken && tokenExpiry && parseInt(tokenExpiry) > Date.now()) {
      return true;
    }
    
    return false;
  },
  
  // Get access token
  getToken: (): string | null => {
    return localStorage.getItem('gmail_token');
  },
  
  // Logout - clear token
  logout: () => {
    localStorage.removeItem('gmail_token');
    localStorage.removeItem('gmail_token_expiry');
    window.location.reload();
  },
  
  // Fetch emails with AI analysis
  fetchEmails: async (geminiService?: GeminiService): Promise<Email[]> => {
    const token = gmailService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Fetch list of messages
      const response = await fetch(
        'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      const messageIds = data.messages || [];
      
      // Fetch details for each message
      const emails = await Promise.all(
        messageIds.map(async (msg: { id: string }) => {
          const msgResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (!msgResponse.ok) {
            throw new Error(`Failed to fetch email ${msg.id}`);
          }
          
          const msgData = await msgResponse.json();
          
          // Extract email info
          const headers = msgData.payload.headers;
          const subject = headers.find((h: {name: string}) => h.name === 'Subject')?.value || 'No Subject';
          const sender = headers.find((h: {name: string}) => h.name === 'From')?.value || 'Unknown';
          const dateHeader = headers.find((h: {name: string}) => h.name === 'Date')?.value;
          
          // Get email body
          let body = '';
          if (msgData.payload.parts && msgData.payload.parts.length > 0) {
            const textPart = msgData.payload.parts.find(
              (part: any) => part.mimeType === 'text/plain'
            );
            if (textPart && textPart.body.data) {
              body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
          } else if (msgData.payload.body && msgData.payload.body.data) {
            body = atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
          
          // Use AI analysis if Gemini service is available
          let summary = 'No summary available';
          let category = 'Personal';
          let priority: 'low' | 'medium' | 'high' = 'medium';
          let aiAnalysis = undefined;
          
          if (geminiService && body.trim()) {
            try {
              console.log(`Analyzing email: ${subject}`);
              const analysis = await geminiService.analyzeEmail(subject, body, sender);
              summary = analysis.summary;
              category = analysis.category;
              priority = analysis.priority;
              
              // Store full AI analysis including new fields
              aiAnalysis = {
                summary: analysis.summary,
                category: analysis.category,
                priority: analysis.priority,
                tasks: analysis.tasks,
                sentiment: analysis.sentiment,
                urgency: analysis.urgency,
                actionRequired: analysis.actionRequired,
                estimatedResponseTime: analysis.estimatedResponseTime
              };
            } catch (error) {
              console.error('Error analyzing email:', error);
            }
          }
          
          // Format timestamp
          let timestamp = 'Unknown time';
          if (dateHeader) {
            try {
              const date = new Date(dateHeader);
              const now = new Date();
              const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
              
              if (diffHours < 1) {
                timestamp = 'Just now';
              } else if (diffHours < 24) {
                timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
              } else {
                const diffDays = Math.floor(diffHours / 24);
                timestamp = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
              }
            } catch (error) {
              timestamp = dateHeader;
            }
          }
          
          return {
            id: msg.id,
            sender,
            subject,
            snippet: msgData.snippet || 'No preview available',
            body,
            category,
            summary,
            timestamp,
            priority,
            read: false,
            aiAnalysis
          };
        })
      );
      
      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }
};
