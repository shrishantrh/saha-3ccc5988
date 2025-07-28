
import React from 'react';
import { Mail } from 'lucide-react';
import EmailDetail from './EmailDetail';
import { Email } from '../types';

interface EmailDetailSectionProps {
  selectedEmail: Email | null;
  handleReplyClick: (email: Email) => void;
  handleSmartReply?: (email: Email) => void;
  onStarEmail?: (emailId: string) => void;
  onArchiveEmail?: (emailId: string) => void;
  onDeleteEmail?: (emailId: string) => void;
}

const EmailDetailSection: React.FC<EmailDetailSectionProps> = ({
  selectedEmail,
  handleReplyClick,
  handleSmartReply,
  onStarEmail,
  onArchiveEmail,
  onDeleteEmail
}) => {
  return (
    <div className="h-full bg-background border-r border-border">
      {selectedEmail ? (
        <EmailDetail 
          email={selectedEmail} 
          onReply={() => handleReplyClick(selectedEmail)}
          onSmartReply={handleSmartReply ? () => handleSmartReply(selectedEmail) : undefined}
          onStar={onStarEmail}
          onArchive={onArchiveEmail}
          onDelete={onDeleteEmail}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Select an email</h3>
            <p className="text-muted-foreground">
              Choose an email from your inbox to view AI-powered insights and smart replies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetailSection;
