
import React, { useState } from 'react';
import { Mail, Reply, Archive, Trash2, Star, MoreHorizontal } from 'lucide-react';
import { Email } from '../types';

interface EmailDetailProps {
  email: Email;
  onReply: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onReply }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Email Header */}
      <div className="p-6 border-b border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span>From: <strong>{email.sender}</strong></span>
              <span>{email.timestamp}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✨</span>
            </div>
            <h3 className="font-medium text-slate-800">AI Summary</h3>
          </div>
          <p className="text-sm text-slate-700">
            {email.summary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-4">
          <button 
            onClick={onReply}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
            <span>Forward</span>
          </button>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{email.sender}</div>
                <div className="text-sm text-slate-500">to me</div>
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {isExpanded && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {email.body}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
