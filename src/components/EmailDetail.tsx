
import React, { useState } from 'react';
import { Mail, Reply, Archive, Trash2, Star, MoreHorizontal, Zap, Clock, CheckCircle, AlertTriangle, Calendar, Sparkles } from 'lucide-react';
import { Email } from '../types';


interface EmailDetailProps {
  email: Email;
  onReply: () => void;
  onSmartReply?: () => void;
  onStar?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ 
  email, 
  onReply, 
  onSmartReply,
  onStar, 
  onArchive, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  
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

  const handleStar = () => {
    setIsStarred(!isStarred);
    if (onStar) {
      onStar(email.id);
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(email.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      if (onDelete) {
        onDelete(email.id);
      }
    }
  };


  return (
    <div className="h-full flex flex-col max-w-4xl">
      {/* Email Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-3">
              <span>From: <strong className="text-foreground">{email.sender}</strong></span>
              <span>{email.timestamp}</span>
            </div>
            
            {/* Simplified AI Insights */}
            <div className="flex items-center space-x-2 text-sm">
              {urgency && (
                <div className="flex items-center space-x-1">
                  <Zap className={`w-3 h-3 ${getUrgencyColor(urgency)}`} />
                  <span className={`text-xs ${getUrgencyColor(urgency)}`}>
                    {urgency}/10
                  </span>
                </div>
              )}
              
              {sentiment && (
                <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(sentiment)}`}>
                  {sentiment}
                </span>
              )}
              
              {actionRequired && (
                <div className="flex items-center space-x-1 text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Action Required</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleStar}
              className={`p-2 hover:bg-accent rounded-lg transition-colors ${
                isStarred ? 'text-yellow-500' : 'text-muted-foreground'
              }`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleArchive}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact AI Summary */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-primary text-sm">✨ AI Summary</span>
            {estimatedResponseTime && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{estimatedResponseTime}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-foreground">
            {email.summary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onReply}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>

          {onSmartReply && (
            <button 
              onClick={onSmartReply}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart Reply</span>
            </button>
          )}
          
          {actionRequired && (
            <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors">
              <CheckCircle className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium text-foreground">{email.sender}</div>
                <div className="text-sm text-muted-foreground">to me</div>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
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
