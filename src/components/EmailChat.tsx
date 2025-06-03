
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, X, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useEmailChat } from '../hooks/useEmailChat';
import { Email } from '../types';
import { GeminiService } from '../services/geminiService';

interface EmailChatProps {
  geminiService: GeminiService | null;
  emails: Email[];
  isOpen: boolean;
  onClose: () => void;
}

const EmailChat: React.FC<EmailChatProps> = ({ geminiService, emails, isOpen, onClose }) => {
  const { messages, isLoading, sendMessage, clearChat, smartSuggestions, generateSmartSuggestions } = useEmailChat(geminiService, emails);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && geminiService && emails.length > 0) {
      generateSmartSuggestions();
    }
  }, [isOpen, geminiService, emails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">AI Email Assistant</h2>
              <p className="text-sm text-slate-600">
                Powered by Gemini • {emails.length} emails analyzed
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Start an intelligent conversation</h3>
              <p className="text-sm mb-6 max-w-md mx-auto">
                Ask me anything about your emails. I can help you find information, summarize content, and manage your tasks.
              </p>
              
              {smartSuggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 mb-4">
                    <Lightbulb className="w-4 h-4" />
                    <span>Smart suggestions based on your emails:</span>
                  </div>
                  <div className="grid gap-3 max-w-lg mx-auto">
                    {smartSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-lg text-sm text-slate-700 transition-all duration-200 hover:shadow-md"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
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
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 max-w-[85%] shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm text-slate-600 ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-slate-200 bg-white">
          <div className="flex space-x-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your emails..."
              className="flex-1 min-h-[50px] max-h-32 resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading || !geminiService}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !geminiService}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!geminiService && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Connect to Gemini in settings to enable AI chat
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmailChat;
