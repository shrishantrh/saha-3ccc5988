
import React, { useState } from 'react';
import { Mail, Reply, Archive, Trash2, Star, MoreHorizontal, Zap, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Email } from '../types';
import MeetingSchedulerComponent from './MeetingScheduler';

interface EmailDetailProps {
  email: Email;
  onReply: () => void;
  onStar?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ 
  email, 
  onReply, 
  onStar, 
  onArchive, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  
  const aiAnalysis = email.aiAnalysis as any;
  const urgency = aiAnalysis?.urgency;
  const sentiment = aiAnalysis?.sentiment;
  const actionRequired = aiAnalysis?.actionRequired;
  const estimatedResponseTime = aiAnalysis?.estimatedResponseTime;

  const getUrgencyColor = (urgency?: number) => {
    if (!urgency) return 'text-gray-400';
    if (urgency >= 8) return 'text-red-500';
    if (urgency >= 6) return 'text-amber-500';
    return 'text-green-500';
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleStar = () => {
    setIsStarred(!isStarred);
    if (onStar) {
      onStar(email.id);
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(email.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      if (onDelete) {
        onDelete(email.id);
      }
    }
  };

  // Check if email might contain meeting request
  const containsMeetingKeywords = (text: string) => {
    const keywords = ['meeting', 'schedule', 'appointment', 'call', 'conference', 'discuss', 'availability', 'time to meet'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const showScheduleButton = containsMeetingKeywords(email.subject + ' ' + email.body);

  return (
    <div className="h-full flex flex-col max-w-4xl">
      {/* Email Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-3 text-sm text-slate-600 mb-3">
              <span>From: <strong className="text-slate-800">{email.sender}</strong></span>
              <span>{email.timestamp}</span>
            </div>
            
            {/* Simplified AI Insights */}
            <div className="flex items-center space-x-2 text-sm">
              {urgency && (
                <div className="flex items-center space-x-1">
                  <Zap className={`w-3 h-3 ${getUrgencyColor(urgency)}`} />
                  <span className={`text-xs ${getUrgencyColor(urgency)}`}>
                    {urgency}/10
                  </span>
                </div>
              )}
              
              {sentiment && (
                <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(sentiment)}`}>
                  {sentiment}
                </span>
              )}
              
              {actionRequired && (
                <div className="flex items-center space-x-1 text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Action Required</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleStar}
              className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${
                isStarred ? 'text-yellow-500' : 'text-slate-500'
              }`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleArchive}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact AI Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600 text-sm">✨ AI Summary</span>
            {estimatedResponseTime && (
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <Clock className="w-3 h-3" />
                <span>{estimatedResponseTime}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-700">
            {email.summary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onReply}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          
          {showScheduleButton && (
            <button 
              onClick={() => setShowMeetingScheduler(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          )}
          
          {actionRequired && (
            <button className="flex items-center space-x-2 px-3 py-2 bg-amber-100 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors">
              <CheckCircle className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{email.sender}</div>
                <div className="text-sm text-slate-500">to me</div>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                {email.body}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerComponent
        isOpen={showMeetingScheduler}
        onClose={() => setShowMeetingScheduler(false)}
        emailContext={{
          subject: email.subject,
          body: email.body,
          sender: email.sender
        }}
      />
    </div>
  );
};

export default EmailDetail;
