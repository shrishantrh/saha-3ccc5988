
import { useState, useEffect } from 'react';
import { googleCalendarService } from '../services/googleCalendarService';
import { CalendarEvent, CalendarInsight, TimeSlot, TaskSuggestion } from '../types/calendar';
import { Task } from '../types';

export const useCalendar = (tasks: Task[]) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<CalendarInsight | null>(null);

  useEffect(() => {
    console.log('useCalendar: Checking initial authentication...');
    const authStatus = googleCalendarService.checkAuth();
    console.log('useCalendar: Initial auth status:', authStatus);
    setIsAuthenticated(authStatus);
  }, []);

  const login = async () => {
    console.log('useCalendar: Starting login process...');
    try {
      setIsLoading(true);
      setError(null);
      await googleCalendarService.authenticateCalendar();
      console.log('useCalendar: Authentication successful');
      setIsAuthenticated(true);
      await fetchEvents();
    } catch (err) {
      const errorMessage = 'Failed to connect to Google Calendar';
      console.error('useCalendar: Calendar auth error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('useCalendar: Starting logout process...');
    try {
      await googleCalendarService.logout();
      setIsAuthenticated(false);
      setEvents([]);
      setInsights(null);
      console.log('useCalendar: Logout successful');
    } catch (err) {
      console.error('useCalendar: Calendar logout error:', err);
    }
  };

  const fetchEvents = async (timeMin?: Date, timeMax?: Date) => {
    console.log('useCalendar: Fetching events, authenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('useCalendar: Not authenticated, skipping fetch');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('useCalendar: Calling googleCalendarService.fetchEvents...');
      const googleEvents = await googleCalendarService.fetchEvents(timeMin, timeMax);
      console.log('useCalendar: Received events:', googleEvents.length);
      
      const convertedEvents: CalendarEvent[] = googleEvents.map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description,
        start: new Date(event.start?.dateTime || event.start?.date),
        end: new Date(event.end?.dateTime || event.end?.date),
        location: event.location,
        source: 'google' as const,
        attendees: event.attendees?.map((a: any) => a.email) || []
      }));

      console.log('useCalendar: Converted events:', convertedEvents.length);
      setEvents(convertedEvents);
      generateInsights(convertedEvents, tasks);
    } catch (err) {
      const errorMessage = 'Failed to fetch calendar events';
      console.error('useCalendar: Fetch events error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (calendarEvents: CalendarEvent[], userTasks: Task[]) => {
    console.log('useCalendar: Generating insights for', calendarEvents.length, 'events and', userTasks.length, 'tasks');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find free time slots for tomorrow
    const tomorrowEvents = calendarEvents.filter(event => 
      event.start >= now && event.start <= tomorrow
    ).sort((a, b) => a.start.getTime() - b.start.getTime());

    const freeSlots: TimeSlot[] = [];
    const busyPeriods: TimeSlot[] = [];

    // Add busy periods
    tomorrowEvents.forEach(event => {
      busyPeriods.push({
        start: event.start,
        end: event.end,
        duration: (event.end.getTime() - event.start.getTime()) / (1000 * 60)
      });
    });

    // Calculate free slots (simplified - between 9 AM and 6 PM)
    const dayStart = new Date(tomorrow);
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date(tomorrow);
    dayEnd.setHours(18, 0, 0, 0);

    let currentTime = dayStart;
    tomorrowEvents.forEach(event => {
      if (currentTime < event.start) {
        const slotDuration = (event.start.getTime() - currentTime.getTime()) / (1000 * 60);
        if (slotDuration >= 30) { // Only slots of 30+ minutes
          freeSlots.push({
            start: new Date(currentTime),
            end: new Date(event.start),
            duration: slotDuration
          });
        }
      }
      currentTime = new Date(Math.max(currentTime.getTime(), event.end.getTime()));
    });

    // Add final slot if day isn't fully booked
    if (currentTime < dayEnd) {
      const slotDuration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60);
      if (slotDuration >= 30) {
        freeSlots.push({
          start: new Date(currentTime),
          end: new Date(dayEnd),
          duration: slotDuration
        });
      }
    }

    // Generate task suggestions based on free time and high-priority tasks
    const highPriorityTasks = userTasks.filter(task => 
      !task.completed && (task.priority === 'high' || task.priority === 'medium')
    );

    const suggestedTasks: TaskSuggestion[] = freeSlots.map(slot => {
      const suitableTasks = highPriorityTasks.filter(task => {
        // Estimate task duration (simplified)
        const estimatedDuration = task.priority === 'high' ? 90 : 60;
        return estimatedDuration <= slot.duration;
      }).slice(0, 2); // Max 2 tasks per slot

      return {
        task: slot.duration >= 120 
          ? `Focus session: Complete ${suitableTasks.length} high-priority tasks`
          : `Quick win: ${suitableTasks[0]?.title || 'Review pending items'}`,
        estimatedDuration: Math.min(slot.duration, 120),
        priority: suitableTasks.some(t => t.priority === 'high') ? 'high' : 'medium',
        taskIds: suitableTasks.map(t => t.id),
        reason: `You have ${Math.floor(slot.duration / 60)}h ${slot.duration % 60}m free at ${slot.start.toLocaleTimeString()}`
      };
    });

    const newInsights = {
      freeSlots,
      suggestedTasks,
      busyPeriods
    };

    console.log('useCalendar: Generated insights:', newInsights);
    setInsights(newInsights);
  };

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
  }) => {
    console.log('useCalendar: Creating event:', eventData);
    try {
      setIsLoading(true);
      const success = await googleCalendarService.createEvent(eventData);
      console.log('useCalendar: Create event result:', success);
      if (success) {
        await fetchEvents(); // Refresh events
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = 'Failed to create calendar event';
      console.error('useCalendar: Create event error:', err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    events,
    isLoading,
    error,
    insights,
    login,
    logout,
    fetchEvents,
    createEvent
  };
};
