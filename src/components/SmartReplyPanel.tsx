import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Loader2, Send, Lightbulb, Copy, Check } from 'lucide-react';
import { SmartReplyService } from '../services/smartReplyService';
import { GeminiService } from '../services/geminiService';
import { Email } from '../types';
import { useToast } from '@/hooks/use-toast';

interface SmartReplyPanelProps {
  email: Email;
  geminiService: GeminiService | null;
  onSendReply: (message: string) => void;
  onClose: () => void;
}

export const SmartReplyPanel: React.FC<SmartReplyPanelProps> = ({
  email,
  geminiService,
  onSendReply,
  onClose
}) => {
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [customReply, setCustomReply] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const smartReplyService = geminiService ? new SmartReplyService(geminiService) : null;

  useEffect(() => {
    if (smartReplyService) {
      generateSmartReplies();
    }
  }, [email, smartReplyService]);

  const generateSmartReplies = async () => {
    if (!smartReplyService) return;
    
    setIsGenerating(true);
    try {
      const replies = await smartReplyService.generateSmartReplies({
        subject: email.subject,
        body: email.body,
        sender: email.sender
      });
      setSmartReplies(replies);
    } catch (error) {
      console.error('Error generating smart replies:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate smart replies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomReply(suggestion);
  };

  const handleCopySuggestion = async (suggestion: string, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied!",
        description: "Reply copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSendReply = () => {
    if (customReply.trim()) {
      onSendReply(customReply);
      setCustomReply('');
      setSelectedSuggestion('');
      onClose();
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully"
      });
    }
  };

  const handleGenerateNew = () => {
    generateSmartReplies();
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Smart Reply to {email.sender}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Smart Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Suggestions</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateNew}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Regenerate"
              )}
            </Button>
          </div>
          
          {isGenerating ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {smartReplies.map((suggestion, index) => (
                <div 
                  key={index}
                  className={`relative group p-3 rounded-md border cursor-pointer transition-all hover:border-primary/50 ${
                    selectedSuggestion === suggestion 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-card hover:bg-accent/50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <p className="text-sm leading-relaxed pr-8">{suggestion}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySuggestion(suggestion, index);
                    }}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Reply */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Your Reply</h4>
          <Textarea
            placeholder="Type your reply or select a suggestion above..."
            value={customReply}
            onChange={(e) => setCustomReply(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendReply}
            disabled={!customReply.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};