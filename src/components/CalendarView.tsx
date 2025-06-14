
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Zap, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useCalendar } from '../hooks/useCalendar';
import { Task } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { isAuthenticated, events, isLoading, error, insights, login, createEvent, fetchEvents } = useCalendar(tasks);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch events when calendar becomes authenticated or date changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Calendar authenticated, fetching events...');
      fetchEvents();
    }
  }, [isAuthenticated, fetchEvents]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentDate(newDate);
    
    // Fetch events for the new month
    if (isAuthenticated) {
      const monthStart = startOfMonth(newDate);
      const monthEnd = endOfMonth(newDate);
      fetchEvents(monthStart, monthEnd);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const handleCreateQuickEvent = async (suggestion: any) => {
    if (!insights?.freeSlots.length) return;
    
    const freeSlot = insights.freeSlots[0];
    const eventData = {
      title: suggestion.task,
      start: freeSlot.start,
      end: new Date(freeSlot.start.getTime() + suggestion.estimatedDuration * 60 * 1000),
      description: `Auto-scheduled from Saha AI - ${suggestion.reason}`
    };

    const success = await createEvent(eventData);
    if (success) {
      console.log('Event created successfully');
    } else {
      console.error('Failed to create event');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-slate-800">Connect Google Calendar</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Get AI-powered scheduling suggestions and automatically create events based on your free time and email analysis.
          </p>
          <Button
            onClick={login}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            size="lg"
          >
            {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Calendar</h2>
            <p className="text-slate-600">
              {isLoading ? 'Loading events...' : `${events.length} events • ${insights?.freeSlots.length || 0} free slots today`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold text-slate-800 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => fetchEvents()}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {insights?.suggestedTasks.length > 0 && !isLoading && (
          <div className="bg-white/80 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              AI Scheduling Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.suggestedTasks.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-md p-3 border border-purple-100">
                  <h4 className="text-sm font-medium text-slate-800 mb-1">{suggestion.task}</h4>
                  <p className="text-xs text-slate-600 mb-2">{suggestion.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600 font-medium">
                      {suggestion.estimatedDuration}min
                    </span>
                    <Button
                      onClick={() => handleCreateQuickEvent(suggestion)}
                      size="sm"
                      className="h-6 px-3 text-xs bg-purple-600 hover:bg-purple-700"
                      disabled={isLoading}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {monthDays.map(day => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
                      !isCurrentMonth ? 'bg-slate-25 text-slate-400' : ''
                    } ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isDayToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate"
                          title={`${event.title} - ${format(event.start, 'h:mm a')}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-slate-200 p-6 bg-slate-50 overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>

          {/* Today's Events */}
          <div className="space-y-4">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h4 className="font-medium text-slate-800 mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-2" />
                      {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2" />
                        {event.location}
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-2" />
                        {event.attendees.length} attendees
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded p-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">No events</h4>
                <p className="text-sm">Your day is free for productivity!</p>
              </div>
            )}
          </div>

          {/* Free Time Slots */}
          {isSameDay(selectedDate, new Date()) && insights?.freeSlots.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Available Time</h4>
              <div className="space-y-2">
                {insights.freeSlots.map((slot, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {slot.start.toLocaleTimeString()} - {slot.end.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-green-600">
                          {Math.floor(slot.duration / 60)}h {slot.duration % 60}m free
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State for Side Panel */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-slate-600">Loading events...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
