import { GeminiService } from './geminiService';
import { googleCalendarService } from './googleCalendarService';

export interface MeetingRequest {
  title: string;
  description?: string;
  duration: number; // in minutes
  attendees: string[];
  preferredTimes?: Date[];
  timezone: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflicts?: string[];
}

export class MeetingScheduler {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  async extractMeetingRequest(emailSubject: string, emailBody: string): Promise<MeetingRequest | null> {
    try {
      const prompt = `Analyze this email and extract meeting request information. If this email contains a meeting request or scheduling inquiry, return a JSON object with the following structure:

{
  "title": "Meeting title/subject",
  "description": "Meeting description or agenda",
  "duration": 60,
  "attendees": ["email1@example.com"],
  "preferredTimes": ["2024-01-15T14:00:00Z"],
  "timezone": "UTC"
}

If this is NOT a meeting request, return null.

Email Subject: ${emailSubject}
Email Body: ${emailBody}

Return ONLY the JSON object or null, no additional text.`;

      const response = await this.geminiService.generateReply({
        subject: emailSubject,
        body: emailBody,
        sender: 'analysis'
      }, prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      console.error('Error extracting meeting request:', error);
      return null;
    }
  }

  async findAvailableSlots(
    startDate: Date,
    endDate: Date,
    duration: number,
    workingHours: { start: number; end: number } = { start: 9, end: 17 }
  ): Promise<TimeSlot[]> {
    try {
      // Fetch existing calendar events
      const events = await googleCalendarService.fetchEvents(startDate, endDate);
      const availableSlots: TimeSlot[] = [];

      // Generate potential time slots
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Skip weekends
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Check each hour during working hours
        for (let hour = workingHours.start; hour < workingHours.end; hour++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + duration);

          // Don't suggest slots that end after working hours
          if (slotEnd.getHours() > workingHours.end) {
            break;
          }

          // Check for conflicts
          const conflicts = events.filter(event => {
            const eventStart = new Date(event.start?.dateTime || event.start?.date);
            const eventEnd = new Date(event.end?.dateTime || event.end?.date);
            
            return (slotStart < eventEnd && slotEnd > eventStart);
          });

          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            available: conflicts.length === 0,
            conflicts: conflicts.map(event => event.summary || 'Busy')
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return availableSlots;
    } catch (error) {
      console.error('Error finding available slots:', error);
      return [];
    }
  }

  async suggestOptimalTimes(
    meetingRequest: MeetingRequest,
    availableSlots: TimeSlot[]
  ): Promise<TimeSlot[]> {
    try {
      const freeSlots = availableSlots.filter(slot => slot.available);
      
      if (freeSlots.length === 0) {
        return [];
      }

      const prompt = `Given this meeting request and available time slots, suggest the 3 most optimal meeting times considering:
- Meeting duration: ${meetingRequest.duration} minutes
- Time zone preferences
- Typical business hours
- Avoiding back-to-back meetings when possible

Meeting: ${meetingRequest.title}
${meetingRequest.description ? `Description: ${meetingRequest.description}` : ''}

Available slots: ${freeSlots.map(slot => 
  `${slot.start.toISOString()} - ${slot.end.toISOString()}`
).join(', ')}

Return the 3 best time slots in this JSON format:
{
  "suggestions": [
    {
      "start": "2024-01-15T14:00:00Z",
      "end": "2024-01-15T15:00:00Z",
      "reason": "Optimal time for productivity, no conflicts"
    }
  ]
}`;

      const response = await this.geminiService.generateReply({
        subject: meetingRequest.title,
        body: prompt,
        sender: 'scheduler'
      }, '');

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.suggestions.map((s: any) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          available: true,
          reason: s.reason
        }));
      }

      // Fallback: return first 3 available slots
      return freeSlots.slice(0, 3);
    } catch (error) {
      console.error('Error suggesting optimal times:', error);
      // Fixed: use freeSlots instead of undefined variable
      const freeSlots = availableSlots.filter(slot => slot.available);
      return freeSlots.slice(0, 3);
    }
  }

  async scheduleRecurringMeeting(
    meetingRequest: MeetingRequest & {
      recurrence: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: Date;
        count?: number;
      };
    }
  ): Promise<boolean> {
    try {
      // Create the first meeting
      const success = await googleCalendarService.createEvent({
        title: meetingRequest.title,
        description: meetingRequest.description,
        start: meetingRequest.preferredTimes?.[0] || new Date(),
        end: new Date((meetingRequest.preferredTimes?.[0] || new Date()).getTime() + meetingRequest.duration * 60000),
      });

      if (!success) {
        return false;
      }

      // For now, create individual recurring events (Google Calendar API can handle recurrence rules)
      // This is a simplified implementation
      return true;
    } catch (error) {
      console.error('Error scheduling recurring meeting:', error);
      return false;
    }
  }
}
