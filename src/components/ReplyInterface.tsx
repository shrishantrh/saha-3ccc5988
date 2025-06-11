
import React, { useState } from 'react';
import { Send, X, Minimize2 } from 'lucide-react';
import { Email } from '../types';

interface ReplyInterfaceProps {
  email: Email;
  onSend: (message: string) => void;
  onCancel: () => void;
}

const ReplyInterface: React.FC<ReplyInterfaceProps> = ({ email, onSend, onCancel }) => {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Continue Reply</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-4xl mx-auto">
        {/* Reply Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-slate-900">Reply to {email.sender}</h3>
            <span className="text-sm text-slate-500">Re: {email.subject}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reply Input */}
        <div className="p-6">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your reply... (Ctrl/Cmd + Enter to send)"
              className="w-full h-32 p-4 pr-16 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              Tip: Use Ctrl/Cmd + Enter to send quickly
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyInterface;
