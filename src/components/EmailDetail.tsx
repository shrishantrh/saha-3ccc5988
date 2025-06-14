
import React, { useState } from 'react';
import { Mail, Reply, Archive, Trash2, Star, MoreHorizontal, Zap, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Email } from '../types';
import MeetingSchedulerComponent from './MeetingScheduler';

interface EmailDetailProps {
  email: Email;
  onReply: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onReply }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  
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

  // Check if email might contain meeting request
  const containsMeetingKeywords = (text: string) => {
    const keywords = ['meeting', 'schedule', 'appointment', 'call', 'conference', 'discuss', 'availability', 'time to meet'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const showScheduleButton = containsMeetingKeywords(email.subject + ' ' + email.body);

  return (
    <div className="h-full flex flex-col">
      {/* Email Header */}
      <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 mb-3 leading-tight">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
              <span>From: <strong className="text-slate-800">{email.sender}</strong></span>
              <span>{email.timestamp}</span>
            </div>
            
            {/* AI Insights Bar */}
            <div className="flex items-center space-x-3 text-sm">
              {urgency && (
                <div className="flex items-center space-x-1">
                  <Zap className={`w-4 h-4 ${getUrgencyColor(urgency)}`} />
                  <span className={`font-medium ${getUrgencyColor(urgency)}`}>
                    Urgency: {urgency}/10
                  </span>
                </div>
              )}
              
              {sentiment && (
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getSentimentColor(sentiment)}`}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} tone
                </span>
              )}
              
              {actionRequired && (
                <div className="flex items-center space-x-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">Action Required</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhanced AI Summary Section */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✨</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">AI Analysis</h3>
              <p className="text-xs text-slate-600">Powered by Gemini</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            {email.summary}
          </p>
          
          {estimatedResponseTime && (
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              <span>Suggested response time: {estimatedResponseTime}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onReply}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Reply className="w-4 h-4" />
            <span className="font-medium">Reply</span>
          </button>
          
          {showScheduleButton && (
            <button 
              onClick={() => setShowMeetingScheduler(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
          )}
          
          <button className="flex items-center space-x-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <span>Forward</span>
          </button>
          {actionRequired && (
            <button className="flex items-center space-x-2 px-4 py-3 bg-amber-100 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors">
              <CheckCircle className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{email.sender}</div>
                <div className="text-sm text-slate-500">to me</div>
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {isExpanded && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
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
