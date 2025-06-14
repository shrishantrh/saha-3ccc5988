
import React, { useState, useEffect } from 'react';
import { Send, X, Minimize2, Sparkles, Loader2 } from 'lucide-react';
import { Email } from '../types';
import { SmartReplyService } from '../services/smartReplyService';
import { useGeminiIntegration } from '../hooks/useGeminiIntegration';
import { gmailService } from '../services/gmailService';
import { useToast } from '../hooks/use-toast';

interface ReplyInterfaceProps {
  email: Email;
  onSend: (message: string) => void;
  onCancel: () => void;
}

const ReplyInterface: React.FC<ReplyInterfaceProps> = ({ email, onSend, onCancel }) => {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingSmartReplies, setIsLoadingSmartReplies] = useState(false);
  const [showSmartReplies, setShowSmartReplies] = useState(false);
  
  const { service: geminiService } = useGeminiIntegration();
  const { toast } = useToast();

  const loadSmartReplies = async () => {
    if (!geminiService) {
      toast({
        title: "AI Service Required",
        description: "Please configure your Gemini API key to use smart replies.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingSmartReplies(true);
    try {
      const smartReplyService = new SmartReplyService(geminiService);
      const replies = await smartReplyService.generateSmartReplies({
        subject: email.subject,
        body: email.body,
        sender: email.sender
      });
      setSmartReplies(replies);
      setShowSmartReplies(true);
    } catch (error) {
      console.error('Error loading smart replies:', error);
      toast({
        title: "Smart Replies Error",
        description: "Failed to generate smart replies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSmartReplies(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      // Extract email from sender field (format: "Name <email@domain.com>" or just "email@domain.com")
      const emailMatch = email.sender.match(/<(.+)>/) || [null, email.sender];
      const recipientEmail = emailMatch[1] || email.sender;
      
      // Send via Gmail API
      await gmailService.sendEmail(
        recipientEmail,
        `Re: ${email.subject}`,
        message
      );
      
      toast({
        title: "Email Sent",
        description: `Your reply has been sent to ${recipientEmail}`,
      });
      
      onSend(message);
      setMessage('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  const selectSmartReply = (reply: string) => {
    setMessage(reply);
    setShowSmartReplies(false);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          <Send className="w-4 h-4" />
          <span>Continue Reply</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-xl">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Reply Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Reply to {email.sender.split('<')[0].trim()}</h3>
              <span className="text-sm text-slate-600">Re: {email.subject}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smart Replies Section */}
        {showSmartReplies && smartReplies.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-25 to-purple-25 border-b border-slate-200">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Smart Reply Suggestions</span>
              <button
                onClick={() => setShowSmartReplies(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2">
              {smartReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => selectSmartReply(reply)}
                  className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-sm"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Reply Input */}
        <div className="p-6 space-y-4">
          {/* AI Smart Replies Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={loadSmartReplies}
              disabled={isLoadingSmartReplies || !geminiService}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-200"
            >
              {isLoadingSmartReplies ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isLoadingSmartReplies ? 'Generating...' : 'AI Smart Replies'}
              </span>
            </button>
            
            {!geminiService && (
              <span className="text-xs text-amber-600">Configure Gemini API for smart replies</span>
            )}
          </div>

          {/* Message Input */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your reply... (Ctrl/Cmd + Enter to send)"
              className="w-full h-36 p-4 pr-16 border-2 border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm leading-relaxed"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-500">
              <span className="inline-flex items-center space-x-1">
                <span>Tip: Use</span>
                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs">Enter</kbd>
                <span>to send quickly</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyInterface;
