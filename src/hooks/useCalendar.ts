
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
    console.log('useCalendar: Checking authentication status...');
    try {
      const authStatus = googleCalendarService.checkAuth();
      console.log('useCalendar: Auth status:', authStatus);
      setIsAuthenticated(authStatus);
      if (authStatus) {
        fetchEvents();
      }
    } catch (err) {
      console.error('useCalendar: Error checking auth:', err);
      setIsAuthenticated(false);
    }
  }, []);

  const login = async () => {
    console.log('useCalendar: Starting login...');
    try {
      setIsLoading(true);
      setError(null);
      await googleCalendarService.authenticateCalendar();
      setIsAuthenticated(true);
      await fetchEvents();
      console.log('useCalendar: Login successful');
    } catch (err) {
      console.error('useCalendar: Login error:', err);
      setError('Failed to connect to Google Calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await googleCalendarService.logout();
      setIsAuthenticated(false);
      setEvents([]);
      setInsights(null);
      console.log('useCalendar: Logout successful');
    } catch (err) {
      console.error('useCalendar: Logout error:', err);
    }
  };

  const fetchEvents = async (timeMin?: Date, timeMax?: Date) => {
    if (!isAuthenticated) {
      console.log('useCalendar: Not authenticated, skipping fetch');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const defaultTimeMin = timeMin || new Date();
      const defaultTimeMax = timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      console.log('useCalendar: Fetching events...');
      const googleEvents = await googleCalendarService.fetchEvents(defaultTimeMin, defaultTimeMax);
      console.log('useCalendar: Retrieved', googleEvents.length, 'events');
      
      const convertedEvents: CalendarEvent[] = googleEvents.map(event => ({
        id: event.id || Math.random().toString(),
        title: event.summary || 'Untitled Event',
        description: event.description,
        start: new Date(event.start?.dateTime || event.start?.date || new Date()),
        end: new Date(event.end?.dateTime || event.end?.date || new Date()),
        location: event.location,
        source: 'google' as const,
        attendees: event.attendees?.map((a: any) => a.email) || []
      }));

      setEvents(convertedEvents);
      generateInsights(convertedEvents, tasks);
    } catch (err) {
      console.error('useCalendar: Fetch error:', err);
      setError('Failed to fetch calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (calendarEvents: CalendarEvent[], userTasks: Task[]) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find today's events
    const todayEvents = calendarEvents.filter(event => 
      event.start >= now && event.start <= tomorrow
    ).sort((a, b) => a.start.getTime() - b.start.getTime());

    const freeSlots: TimeSlot[] = [];
    const busyPeriods: TimeSlot[] = [];

    // Add busy periods
    todayEvents.forEach(event => {
      busyPeriods.push({
        start: event.start,
        end: event.end,
        duration: (event.end.getTime() - event.start.getTime()) / (1000 * 60)
      });
    });

    // Simple free time calculation (9 AM to 6 PM)
    const dayStart = new Date();
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(18, 0, 0, 0);

    if (todayEvents.length === 0) {
      // Full day free
      freeSlots.push({
        start: dayStart,
        end: dayEnd,
        duration: 9 * 60 // 9 hours
      });
    } else {
      // Calculate gaps between events
      let currentTime = dayStart;
      todayEvents.forEach(event => {
        if (currentTime < event.start) {
          const duration = (event.start.getTime() - currentTime.getTime()) / (1000 * 60);
          if (duration >= 30) {
            freeSlots.push({
              start: new Date(currentTime),
              end: new Date(event.start),
              duration
            });
          }
        }
        currentTime = new Date(Math.max(currentTime.getTime(), event.end.getTime()));
      });

      // Add final slot if available
      if (currentTime < dayEnd) {
        const duration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60);
        if (duration >= 30) {
          freeSlots.push({
            start: new Date(currentTime),
            end: new Date(dayEnd),
            duration
          });
        }
      }
    }

    // Generate task suggestions
    const highPriorityTasks = userTasks.filter(task => 
      !task.completed && task.priority === 'high'
    ).slice(0, 3);

    const suggestedTasks: TaskSuggestion[] = freeSlots.slice(0, 2).map((slot, index) => ({
      task: highPriorityTasks[index]?.title || `Focus session ${index + 1}`,
      estimatedDuration: Math.min(slot.duration, 90),
      priority: 'high' as const,
      taskIds: highPriorityTasks[index] ? [highPriorityTasks[index].id] : [],
      reason: `${Math.floor(slot.duration / 60)}h ${slot.duration % 60}m available`
    }));

    setInsights({
      freeSlots,
      suggestedTasks,
      busyPeriods
    });
  };

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
  }) => {
    try {
      setIsLoading(true);
      const success = await googleCalendarService.createEvent(eventData);
      if (success) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (err) {
      console.error('useCalendar: Create event error:', err);
      setError('Failed to create event');
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
