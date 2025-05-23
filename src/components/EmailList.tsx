
import React from 'react';
import { Mail, Circle, AlertCircle, Clock } from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
}

const categoryColors = {
  'Academic': 'bg-blue-100 text-blue-700 border-blue-200',
  'Admissions': 'bg-purple-100 text-purple-700 border-purple-200',
  'Events': 'bg-green-100 text-green-700 border-green-200',
  'Personal': 'bg-orange-100 text-orange-700 border-orange-200',
  'Work': 'bg-red-100 text-red-700 border-red-200'
};

const priorityColors = {
  'high': 'text-red-500',
  'medium': 'text-yellow-500', 
  'low': 'text-green-500'
};

const EmailList: React.FC<EmailListProps> = ({ emails, onEmailSelect, selectedEmail }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Inbox</h2>
        <div className="text-sm text-slate-600">
          {emails.filter(e => !e.read).length} unread messages
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => onEmailSelect(email)}
            className={`p-4 border-b border-slate-100 cursor-pointer transition-all duration-200 hover:bg-white/80 ${
              selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
            } ${!email.read ? 'bg-white/90' : 'bg-slate-50/50'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  {!email.read && <Circle className="w-2 h-2 text-blue-500 fill-current" />}
                  <AlertCircle className={`w-4 h-4 ${priorityColors[email.priority]}`} />
                </div>
                <span className="font-medium text-slate-800 truncate text-sm">
                  {email.sender}
                </span>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {email.timestamp}
              </span>
            </div>
            
            <div className="mb-2">
              <h3 className={`text-sm ${!email.read ? 'font-semibold' : 'font-medium'} text-slate-900 mb-1 line-clamp-2`}>
                {email.subject}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                {email.snippet}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${
                categoryColors[email.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {email.category}
              </span>
              
              <div className="text-xs text-slate-500">
                AI Summary ✨
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-slate-50 rounded-md">
              <p className="text-xs text-slate-700 italic">
                {email.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailList;
