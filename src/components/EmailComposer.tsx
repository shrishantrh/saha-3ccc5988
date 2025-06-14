
import React, { useState } from 'react';
import { Send, X, Paperclip, Bold, Italic, Underline, AlignLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
  }) => void;
  replyTo?: {
    to: string;
    subject: string;
  };
}

const EmailComposer: React.FC<EmailComposerProps> = ({ isOpen, onClose, onSend, replyTo }) => {
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo?.subject ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return;
    
    setIsSending(true);
    try {
      await onSend({
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim(),
        body: body.trim()
      });
      
      // Reset form
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-lg font-semibold text-slate-800">Compose Email</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Email Form */}
        <div className="flex-1 flex flex-col p-6 space-y-4">
          {/* To Field */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Label htmlFor="to" className="w-12 text-right text-sm font-medium">To:</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1"
              />
              <div className="flex space-x-2">
                {!showCc && (
                  <button
                    onClick={() => setShowCc(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    onClick={() => setShowBcc(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Bcc
                  </button>
                )}
              </div>
            </div>

            {/* Cc Field */}
            {showCc && (
              <div className="flex items-center space-x-4">
                <Label htmlFor="cc" className="w-12 text-right text-sm font-medium">Cc:</Label>
                <Input
                  id="cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                  className="flex-1"
                />
                <button
                  onClick={() => { setShowCc(false); setCc(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bcc Field */}
            {showBcc && (
              <div className="flex items-center space-x-4">
                <Label htmlFor="bcc" className="w-12 text-right text-sm font-medium">Bcc:</Label>
                <Input
                  id="bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                  className="flex-1"
                />
                <button
                  onClick={() => { setShowBcc(false); setBcc(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Subject Field */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="subject" className="w-12 text-right text-sm font-medium">Subject:</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1"
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
            <Button variant="ghost" size="sm">
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Underline className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-300 mx-2" />
            <Button variant="ghost" size="sm">
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>

          {/* Body Field */}
          <div className="flex-1 flex flex-col space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">Message:</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email..."
              className="flex-1 min-h-[200px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach files
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!to.trim() || !subject.trim() || isSending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
