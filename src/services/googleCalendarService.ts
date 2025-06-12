
class GoogleCalendarService {
  private accessToken: string | null = null;
  private readonly CLIENT_ID = '881935451747-qhc9n0jtlpe206rb2ri50kaajsl196hp.apps.googleusercontent.com';

  async initialize() {
    if (!window.google) {
      await this.loadGoogleIdentityServices();
    }
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  async authenticateCalendar(): Promise<void> {
    try {
      await this.initialize();
      
      return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error('Failed to authenticate with Google Calendar'));
              return;
            }
            
            this.accessToken = response.access_token;
            localStorage.setItem('calendar_access_token', this.accessToken);
            resolve();
          },
        });
        
        tokenClient.requestAccessToken();
      });
    } catch (error) {
      throw new Error('Failed to authenticate with Google Calendar');
    }
  }

  checkAuth(): boolean {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('calendar_access_token');
    }
    return !!this.accessToken;
  }

  private async makeCalendarRequest(endpoint: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`);
    }

    return response.json();
  }

  async fetchEvents(timeMin?: Date, timeMax?: Date): Promise<any[]> {
    try {
      const now = new Date();
      const minTime = timeMin || now;
      const maxTime = timeMax || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const params = new URLSearchParams({
        timeMin: minTime.toISOString(),
        timeMax: maxTime.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await this.makeCalendarRequest(`calendars/primary/events?${params}`);
      return response.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  async createEvent(event: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
  }): Promise<boolean> {
    try {
      const eventData = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: event.location,
      };

      await this.makeCalendarRequest('calendars/primary/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      return true;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken && window.google) {
        window.google.accounts.oauth2.revoke(this.accessToken);
      }
      this.accessToken = null;
      localStorage.removeItem('calendar_access_token');
    } catch (error) {
      console.error('Error signing out of calendar:', error);
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
