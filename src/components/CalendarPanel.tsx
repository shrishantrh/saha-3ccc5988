
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ExternalLink, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useCalendar } from '../hooks/useCalendar';
import { Task } from '../types';
import { format } from 'date-fns';

interface CalendarPanelProps {
  tasks: Task[];
  onCreateEvent?: (eventData: { title: string; start: Date; end: Date }) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ tasks, onCreateEvent }) => {
  const { isAuthenticated, events, isLoading, error, insights, login, logout, createEvent } = useCalendar(tasks);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    if (success && onCreateEvent) {
      onCreateEvent(eventData);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white/60 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Calendar</h2>
          <p className="text-sm text-slate-600">Connect for smart scheduling</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800">Connect Google Calendar</h3>
            <p className="text-sm text-slate-600 mb-4 max-w-sm">
              Get AI-powered scheduling suggestions and automatically create events based on your free time.
            </p>
            <Button
              onClick={login}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Connecting...' : 'Connect Calendar'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-slate-800">Calendar</h2>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Disconnect
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          {events.length} events • {insights?.freeSlots.length || 0} free slots
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Smart Suggestions */}
        {insights?.suggestedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-600 mb-2 flex items-center uppercase tracking-wide">
              <Zap className="w-3 h-3 mr-1" />
              Smart Suggestions ({insights.suggestedTasks.length})
            </h3>
            <div className="space-y-2">
              {insights.suggestedTasks.map((suggestion, index) => (
                <div key={index} className="p-3 border border-slate-200 rounded-md bg-gradient-to-r from-blue-50 to-purple-50">
                  <h4 className="text-sm font-medium text-slate-900 mb-1">{suggestion.task}</h4>
                  <p className="text-xs text-slate-600 mb-2">{suggestion.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600 font-medium">
                      {suggestion.estimatedDuration}min • {suggestion.priority} priority
                    </span>
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

        {/* Free Time Slots */}
        {insights?.freeSlots.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-600 mb-2 flex items-center uppercase tracking-wide">
              <Clock className="w-3 h-3 mr-1" />
              Free Time Today ({insights.freeSlots.length})
            </h3>
            <div className="space-y-2">
              {insights.freeSlots.map((slot, index) => (
                <div key={index} className="p-2 border border-slate-200 rounded-md bg-white/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {slot.start.toLocaleTimeString()} - {slot.end.toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-slate-600">
                        {Math.floor(slot.duration / 60)}h {slot.duration % 60}m available
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-600 mb-2 flex items-center uppercase tracking-wide">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Upcoming Events ({events.slice(0, 5).length})
            </h3>
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="p-2 border border-slate-200 rounded-md bg-white/80">
                  <h4 className="text-sm font-medium text-slate-900 mb-1">{event.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600">
                      {format(event.start, 'MMM dd, h:mm a')}
                    </p>
                    {event.source === 'google' && (
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && !isLoading && (
          <div className="text-center text-slate-500 py-8">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No events today</h3>
            <p className="text-sm">Your calendar is free for productivity!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPanel;
