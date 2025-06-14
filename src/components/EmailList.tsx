
import React from 'react';
import { Mail, Circle, AlertCircle, Clock, CheckSquare, Calendar, Zap, Frown, Meh, Smile } from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
  selectedEmails?: Set<string>;
  onSelectEmail?: (emailId: string) => void;
}

const categoryColors = {
  'Academic': 'bg-blue-100 text-blue-700 border-blue-200',
  'Admissions': 'bg-purple-100 text-purple-700 border-purple-200',
  'Events': 'bg-green-100 text-green-700 border-green-200',
  'Personal': 'bg-orange-100 text-orange-700 border-orange-200',
  'Work': 'bg-red-100 text-red-700 border-red-200',
  'Finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Travel': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Shopping': 'bg-pink-100 text-pink-700 border-pink-200',
  'Social': 'bg-violet-100 text-violet-700 border-violet-200',
  'Health': 'bg-rose-100 text-rose-700 border-rose-200',
  'Legal': 'bg-slate-100 text-slate-700 border-slate-200',
  'Technology': 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

const priorityColors = {
  'high': 'text-red-500',
  'medium': 'text-amber-500', 
  'low': 'text-green-500'
};

const sentimentIcons = {
  'positive': { icon: Smile, color: 'text-green-500' },
  'neutral': { icon: Meh, color: 'text-gray-500' },
  'negative': { icon: Frown, color: 'text-red-500' }
};

const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  onEmailSelect, 
  selectedEmail, 
  selectedEmails = new Set(),
  onSelectEmail 
}) => {
  const getTaskCount = (email: Email) => {
    return email.aiAnalysis?.tasks?.length || 0;
  };

  const getUrgencyColor = (urgency?: number) => {
    if (!urgency) return 'text-gray-400';
    if (urgency >= 8) return 'text-red-500';
    if (urgency >= 6) return 'text-amber-500';
    return 'text-green-500';
  };

  const handleEmailClick = (email: Email, e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) {
      return; // Don't select email if clicking checkbox
    }
    onEmailSelect(email);
  };

  const handleCheckboxChange = (emailId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelectEmail) {
      onSelectEmail(emailId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
      <div className="p-3 border-b border-slate-200 bg-white shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-1 flex items-center">
          <Mail className="w-4 h-4 mr-2 text-blue-600" />
          Inbox
        </h2>
        <div className="text-xs text-slate-600 flex items-center justify-between">
          <span>{emails.filter(e => !e.read).length} unread</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {emails.length} total
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => {
          const taskCount = getTaskCount(email);
          const sentiment = (email.aiAnalysis as any)?.sentiment;
          const urgency = (email.aiAnalysis as any)?.urgency;
          const SentimentIcon = sentiment ? sentimentIcons[sentiment as keyof typeof sentimentIcons]?.icon : null;
          const sentimentColor = sentiment ? sentimentIcons[sentiment as keyof typeof sentimentIcons]?.color : '';
          const isSelected = selectedEmails.has(email.id);
          
          return (
            <div
              key={email.id}
              onClick={(e) => handleEmailClick(email, e)}
              className={`p-3 border-b border-slate-100 cursor-pointer transition-all duration-200 hover:bg-blue-50/50 hover:shadow-sm min-h-[140px] max-h-[140px] flex flex-col ${
                selectedEmail?.id === email.id ? 'bg-blue-100 border-blue-300 shadow-md' : ''
              } ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${!email.read ? 'bg-white border-l-4 border-l-blue-500' : 'bg-slate-50/30'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    {onSelectEmail && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(email.id, e)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    {!email.read && <Circle className="w-2 h-2 text-blue-500 fill-current" />}
                    <AlertCircle className={`w-3 h-3 ${priorityColors[email.priority]}`} />
                    {urgency && (
                      <div className="flex items-center space-x-1">
                        <Zap className={`w-3 h-3 ${getUrgencyColor(urgency)}`} />
                        <span className={`text-xs font-medium ${getUrgencyColor(urgency)}`}>
                          {urgency}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-slate-800 truncate text-xs">
                    {email.sender}
                  </span>
                  {SentimentIcon && (
                    <SentimentIcon className={`w-3 h-3 ${sentimentColor}`} />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {taskCount > 0 && (
                    <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      <CheckSquare className="w-2.5 h-2.5" />
                      <span className="text-xs font-medium">{taskCount}</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {email.timestamp}
                  </span>
                </div>
              </div>
              
              <div className="mb-2 flex-1">
                <h3 className={`text-sm ${!email.read ? 'font-semibold' : 'font-medium'} text-slate-900 mb-1 line-clamp-1`}>
                  {email.subject}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {email.snippet}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 flex-wrap">
                  <span className={`inline-block px-1.5 py-0.5 rounded-md text-xs font-medium border ${
                    categoryColors[email.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {email.category}
                  </span>
                  
                  {/* Labels */}
                  {(email as any).labels?.slice(0, 2).map((label: string) => (
                    <span key={label} className="inline-block px-1.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      {label}
                    </span>
                  ))}
                  
                  {(email.aiAnalysis as any)?.actionRequired && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      <Calendar className="w-2.5 h-2.5 mr-1" />
                      Action
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-purple-600 font-medium">
                  ✨ AI
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200 flex-1">
                <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                  {email.summary}
                </p>
                {(email.aiAnalysis as any)?.estimatedResponseTime && (
                  <div className="mt-1 flex items-center text-xs text-slate-600">
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    Response: {(email.aiAnalysis as any).estimatedResponseTime}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmailList;
