
import React from 'react';
import { Mail, Circle, AlertCircle, Clock, CheckSquare, Calendar, Zap, Frown, Meh, Smile, Tag } from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
  selectedEmails?: Set<string>;
  onSelectEmail?: (emailId: string) => void;
}

const categoryColors = {
  'Academic': 'bg-blue-50 text-blue-700 border-blue-200',
  'Admissions': 'bg-purple-50 text-purple-700 border-purple-200',
  'Events': 'bg-green-50 text-green-700 border-green-200',
  'Personal': 'bg-orange-50 text-orange-700 border-orange-200',
  'Work': 'bg-red-50 text-red-700 border-red-200',
  'Finance': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Travel': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Shopping': 'bg-pink-50 text-pink-700 border-pink-200',
  'Social': 'bg-violet-50 text-violet-700 border-violet-200',
  'Health': 'bg-rose-50 text-rose-700 border-rose-200',
  'Legal': 'bg-gray-50 text-gray-700 border-gray-200',
  'Technology': 'bg-indigo-50 text-indigo-700 border-indigo-200'
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
    e.preventDefault();
    e.stopPropagation();
    console.log('Email clicked:', email.subject);
    onEmailSelect(email);
  };

  const handleCheckboxChange = (emailId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Checkbox changed for email:', emailId, 'checked:', e.target.checked);
    
    if (onSelectEmail) {
      try {
        onSelectEmail(emailId);
      } catch (error) {
        console.error('Error in checkbox handler:', error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-blue-600" />
          Inbox
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-blue-600">{emails.filter(e => !e.read).length}</span> unread
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
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
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 group ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' : ''
              } ${isSelected ? 'bg-blue-25' : ''} ${!email.read ? 'bg-white' : 'bg-gray-25'}`}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {onSelectEmail && (
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(email.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 w-4 h-4"
                      />
                    </div>
                  )}
                  {!email.read && <Circle className="w-2 h-2 text-blue-500 fill-current flex-shrink-0" />}
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 ${priorityColors[email.priority]}`} />
                  
                  {/* AI Insights - Hidden by default, shown on hover */}
                  <div className="relative group/ai">
                    <div className="opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                      {urgency && (
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Zap className={`w-3 h-3 ${getUrgencyColor(urgency)}`} />
                          <span className={`text-xs font-medium ${getUrgencyColor(urgency)}`}>
                            {urgency}
                          </span>
                        </div>
                      )}
                      {SentimentIcon && (
                        <SentimentIcon className={`w-3 h-3 flex-shrink-0 ${sentimentColor}`} />
                      )}
                    </div>
                    {(urgency || SentimentIcon) && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full group-hover/ai:hidden" />
                    )}
                  </div>
                  
                  <span 
                    className={`font-medium text-gray-900 truncate text-sm ${!email.read ? 'font-semibold' : ''} cursor-pointer`}
                    onClick={(e) => handleEmailClick(email, e)}
                  >
                    {email.sender}
                  </span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {taskCount > 0 && (
                    <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                      <CheckSquare className="w-3 h-3" />
                      <span className="text-xs font-medium">{taskCount}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {email.timestamp}
                  </span>
                </div>
              </div>
              
              {/* Subject and Snippet - clickable */}
              <div className="mb-3" onClick={(e) => handleEmailClick(email, e)}>
                <h3 className={`text-sm mb-2 line-clamp-1 ${!email.read ? 'font-semibold' : 'font-medium'} text-gray-900 cursor-pointer`}>
                  {email.subject}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed cursor-pointer">
                  {email.snippet}
                </p>
              </div>

              {/* AI-Generated Category and Labels */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                    categoryColors[email.category as keyof typeof categoryColors] || 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {email.category}
                  </span>
                  
                  {/* Show additional labels applied to this email */}
                  {(email as any).labels?.filter((label: string) => label !== email.category).slice(0, 2).map((label: string) => (
                    <span key={label} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {label}
                    </span>
                  ))}
                  
                  {(email.aiAnalysis as any)?.actionRequired && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Calendar className="w-3 h-3 mr-1" />
                      Action Required
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-purple-600 font-medium flex items-center space-x-1">
                  <span>✨</span>
                  <span>AI</span>
                </div>
              </div>
              
              {/* Enhanced AI Summary - clickable */}
              <div className="p-3 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-lg border border-blue-200" onClick={(e) => handleEmailClick(email, e)}>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 cursor-pointer">
                  {email.summary}
                </p>
                {(email.aiAnalysis as any)?.estimatedResponseTime && (
                  <div className="mt-2 flex items-center text-xs text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Response: {(email.aiAnalysis as any).estimatedResponseTime}</span>
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
