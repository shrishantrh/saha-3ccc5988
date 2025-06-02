
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useEmailChat } from '../hooks/useEmailChat';
import { Email } from '../types';
import { GroqService } from '../services/groqService';

interface EmailChatProps {
  groqService: GroqService | null;
  emails: Email[];
  isOpen: boolean;
  onClose: () => void;
}

const EmailChat: React.FC<EmailChatProps> = ({ groqService, emails, isOpen, onClose }) => {
  const { messages, isLoading, sendMessage, clearChat } = useEmailChat(groqService, emails);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Email AI Assistant</h2>
              <p className="text-sm text-slate-500">
                Ask me anything about your {emails.length} emails
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-slate-600 hover:text-slate-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm mb-4">Ask me anything about your emails. For example:</p>
              <div className="text-sm space-y-2 max-w-md mx-auto">
                <div className="bg-slate-50 p-2 rounded-md">"When is my Stanford application due?"</div>
                <div className="bg-slate-50 p-2 rounded-md">"What emails did I get from professors?"</div>
                <div className="bg-slate-50 p-2 rounded-md">"Show me all high priority emails"</div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
          <div className="flex space-x-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your emails..."
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              disabled={isLoading || !groqService}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !groqService}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!groqService && (
            <p className="text-xs text-slate-500 mt-2">
              Connect to Groq in settings to enable AI chat
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmailChat;
