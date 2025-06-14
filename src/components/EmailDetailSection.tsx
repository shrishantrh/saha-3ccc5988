
import React from 'react';
import { Mail } from 'lucide-react';
import EmailDetail from './EmailDetail';
import { Email } from '../types';

interface EmailDetailSectionProps {
  selectedEmail: Email | null;
  handleReplyClick: (email: Email) => void;
}

const EmailDetailSection: React.FC<EmailDetailSectionProps> = ({
  selectedEmail,
  handleReplyClick
}) => {
  return (
    <div className="flex-1 bg-white">
      {selectedEmail ? (
        <EmailDetail 
          email={selectedEmail} 
          onReply={() => handleReplyClick(selectedEmail)}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Select an email</h3>
            <p className="text-gray-600 leading-relaxed">
              Choose an email from your inbox to view AI-powered insights, 
              smart replies, and intelligent task extraction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetailSection;
