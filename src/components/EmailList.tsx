
import React from 'react';
import { Mail, Circle, AlertCircle, CheckSquare, Clock, Zap, Frown, Meh, Smile } from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
  selectedEmails?: Set<string>;
  onSelectEmail?: (emailId: string) => void;
}

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
    e.preventDefault();
    e.stopPropagation();
    onEmailSelect(email);
  };

  const handleCheckboxChange = (emailId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelectEmail) {
      onSelectEmail(emailId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-blue-600" />
          Inbox
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-blue-600">{emails.filter(e => !e.read).length}</span> unread
          </span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
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
              className={`p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              } ${isSelected ? 'bg-blue-25' : ''} ${!email.read ? 'bg-white' : 'bg-gray-25'}`}
              onClick={(e) => handleEmailClick(email, e)}
            >
              {/* Header Row - Simplified */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {onSelectEmail && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleCheckboxChange(email.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  )}
                  {!email.read && <Circle className="w-2 h-2 text-blue-500 fill-current" />}
                  <AlertCircle className={`w-4 h-4 ${priorityColors[email.priority]}`} />
                  <span className={`font-medium text-gray-900 truncate text-sm ${!email.read ? 'font-semibold' : ''}`}>
                    {email.sender}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {urgency && (
                    <div className="flex items-center space-x-1">
                      <Zap className={`w-3 h-3 ${getUrgencyColor(urgency)}`} />
                      <span className={getUrgencyColor(urgency)}>{urgency}</span>
                    </div>
                  )}
                  {SentimentIcon && <SentimentIcon className={`w-3 h-3 ${sentimentColor}`} />}
                  <span>{email.timestamp}</span>
                </div>
              </div>
              
              {/* Subject and Snippet */}
              <div className="mb-2">
                <h3 className={`text-sm mb-1 line-clamp-1 ${!email.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                  {email.subject}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {email.snippet}
                </p>
              </div>

              {/* Bottom Row - Simplified */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {email.category}
                  </span>
                  
                  {taskCount > 0 && (
                    <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">
                      <CheckSquare className="w-3 h-3" />
                      <span>{taskCount}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-purple-600 font-medium flex items-center space-x-1">
                  <span>✨</span>
                </div>
              </div>
              
              {/* AI Summary - Compact */}
              <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded border border-blue-200">
                <p className="text-xs text-gray-700 line-clamp-2">
                  {email.summary}
                </p>
                {(email.aiAnalysis as any)?.estimatedResponseTime && (
                  <div className="mt-1 flex items-center text-xs text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{(email.aiAnalysis as any).estimatedResponseTime}</span>
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
