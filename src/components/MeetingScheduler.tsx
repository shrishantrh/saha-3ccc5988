
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Repeat, Send, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { MeetingScheduler, MeetingRequest, TimeSlot } from '../services/meetingScheduler';
import { useGeminiIntegration } from '../hooks/useGeminiIntegration';
import { useCalendar } from '../hooks/useCalendar';
import { useToast } from '../hooks/use-toast';

interface MeetingSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  emailContext?: {
    subject: string;
    body: string;
    sender: string;
  };
}

const MeetingSchedulerComponent: React.FC<MeetingSchedulerProps> = ({ 
  isOpen, 
  onClose, 
  emailContext 
}) => {
  const [meetingData, setMeetingData] = useState<Partial<MeetingRequest>>({
    title: '',
    description: '',
    duration: 60,
    attendees: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [suggestedSlots, setSuggestedSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    count: 4
  });

  const { service: geminiService } = useGeminiIntegration();
  const { createEvent, isAuthenticated } = useCalendar([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && emailContext && geminiService) {
      analyzeEmailForMeeting();
    }
  }, [isOpen, emailContext, geminiService]);

  const analyzeEmailForMeeting = async () => {
    if (!emailContext || !geminiService) return;

    setIsAnalyzing(true);
    try {
      const scheduler = new MeetingScheduler(geminiService);
      const extractedMeeting = await scheduler.extractMeetingRequest(
        emailContext.subject,
        emailContext.body
      );

      if (extractedMeeting) {
        setMeetingData({
          ...extractedMeeting,
          attendees: [emailContext.sender, ...extractedMeeting.attendees]
        });
        
        // Find available slots for the next 7 days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        
        const availableSlots = await scheduler.findAvailableSlots(
          startDate,
          endDate,
          extractedMeeting.duration
        );

        const optimal = await scheduler.suggestOptimalTimes(extractedMeeting, availableSlots);
        setSuggestedSlots(optimal);
      }
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze email for meeting details.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedSlot || !meetingData.title || !isAuthenticated) return;

    setIsScheduling(true);
    try {
      const success = await createEvent({
        title: meetingData.title,
        description: meetingData.description,
        start: selectedSlot.start,
        end: selectedSlot.end,
        location: ''
      });

      if (success) {
        toast({
          title: "Meeting Scheduled",
          description: `"${meetingData.title}" has been added to your calendar.`,
        });
        onClose();
      } else {
        throw new Error('Failed to create calendar event');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule the meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calendar Access Required</h3>
            <p className="text-slate-600 mb-4">
              Please connect your Google Calendar to schedule meetings.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Schedule Meeting</h2>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing email for meeting details...</span>
              </div>
            </div>
          )}

          {/* Meeting Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                value={meetingData.title || ''}
                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                placeholder="Enter meeting title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={meetingData.description || ''}
                onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                placeholder="Meeting agenda or description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select 
                  value={meetingData.duration?.toString()} 
                  onValueChange={(value) => setMeetingData({ ...meetingData, duration: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowRecurring(!showRecurring)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    showRecurring 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm">Recurring</span>
                </button>
              </div>
            </div>

            {showRecurring && (
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={recurrence.frequency} 
                      onValueChange={(value: any) => setRecurrence({ ...recurrence, frequency: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="count">Number of meetings</Label>
                    <Input
                      id="count"
                      type="number"
                      value={recurrence.count}
                      onChange={(e) => setRecurrence({ ...recurrence, count: parseInt(e.target.value) })}
                      min="1"
                      max="52"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Time Slots */}
          {suggestedSlots.length > 0 && (
            <div>
              <Label>Suggested Time Slots</Label>
              <div className="mt-2 space-y-2">
                {suggestedSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedSlot === slot
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-medium">
                            {slot.start.toLocaleDateString()} at {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-slate-600">
                            {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            ({meetingData.duration} min)
                          </div>
                        </div>
                      </div>
                      {(slot as any).reason && (
                        <div className="text-xs text-blue-600">
                          {(slot as any).reason}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              onClick={handleScheduleMeeting}
              disabled={!selectedSlot || !meetingData.title || isScheduling}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSchedulerComponent;
