
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, Zap, AlertCircle, Link } from 'lucide-react';
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents(monthStart, monthEnd);
    }
  }, [isAuthenticated, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const handleCreateQuickEvent = async (suggestion: any) => {
    if (!insights?.freeSlots.length) return;
    
    const freeSlot = insights.freeSlots[0];
    const success = await createEvent({
      title: suggestion.task,
      start: freeSlot.start,
      end: new Date(freeSlot.start.getTime() + suggestion.estimatedDuration * 60 * 1000),
      description: `Auto-scheduled from Saha AI`
    });
    
    if (success) {
      console.log('Event created successfully');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-slate-800">Connect Google Calendar</h3>
          <p className="text-slate-600 mb-6">
            Get AI-powered scheduling suggestions and manage your calendar directly.
          </p>
          <Button
            onClick={login}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>Connect Calendar</span>
              </div>
            )}
          </Button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
            <p className="text-slate-600 text-sm">
              {events.length} events • {insights?.freeSlots.length || 0} free slots today
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold text-slate-800 min-w-[120px] text-center">
              {format(currentDate, 'MMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button onClick={() => fetchEvents()} variant="outline" size="sm" disabled={isLoading}>
              {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* AI Suggestions */}
        {insights?.suggestedTasks.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Smart Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {insights.suggestedTasks.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="bg-purple-50 rounded p-2 border border-purple-100">
                  <h4 className="text-sm font-medium text-slate-800 mb-1">{suggestion.task}</h4>
                  <p className="text-xs text-slate-600 mb-2">{suggestion.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600">{suggestion.estimatedDuration}min</span>
                    <Button
                      onClick={() => handleCreateQuickEvent(suggestion)}
                      size="sm"
                      className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700"
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
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Days header */}
            <div className="grid grid-cols-7 bg-slate-50 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
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
                    className={`min-h-[80px] p-2 border-b border-r border-slate-100 cursor-pointer hover:bg-slate-50 ${
                      !isCurrentMonth ? 'bg-slate-25 text-slate-400' : ''
                    } ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isDayToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate"
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-72 border-l border-slate-200 p-4 bg-slate-50 overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            {format(selectedDate, 'MMM d')}
          </h3>

          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="bg-white rounded-lg p-3 border">
                  <h4 className="font-medium text-slate-800 mb-1">{event.title}</h4>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-6">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events scheduled</p>
            </div>
          )}

          {/* Free Time */}
          {isSameDay(selectedDate, new Date()) && insights?.freeSlots.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Free Time</h4>
              {insights.freeSlots.map((slot, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                  <p className="text-sm font-medium text-green-800">
                    {slot.start.toLocaleTimeString()} - {slot.end.toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-green-600">
                    {Math.floor(slot.duration / 60)}h {slot.duration % 60}m available
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
