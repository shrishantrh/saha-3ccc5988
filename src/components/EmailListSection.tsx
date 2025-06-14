
import React from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import EmailList from './EmailList';
import EmailBulkActions from './EmailBulkActions';
import { Email } from '../types';

interface EmailListSectionProps {
  displayEmails: Email[];
  selectedEmails: Set<string>;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  handleBulkMarkAsRead: () => void;
  handleBulkMarkAsUnread: () => void;
  handleBulkArchive: () => void;
  handleBulkDelete: () => void;
  handleAddLabel: (labelName: string) => void;
  isAllSelected: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isGeminiConnected: boolean;
  handleEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
  handleSelectEmail: (emailId: string) => void;
  labels: Array<{ id: string; name: string; color: string; count: number }>;
  aiCategories: Array<{ name: string; count: number; color: string }>;
}

const EmailListSection: React.FC<EmailListSectionProps> = ({
  displayEmails,
  selectedEmails,
  handleSelectAll,
  handleDeselectAll,
  handleBulkMarkAsRead,
  handleBulkMarkAsUnread,
  handleBulkArchive,
  handleBulkDelete,
  handleAddLabel,
  isAllSelected,
  isLoading,
  error,
  refetch,
  isGeminiConnected,
  handleEmailSelect,
  selectedEmail,
  handleSelectEmail,
  labels,
  aiCategories
}) => {
  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Bulk Actions */}
      <EmailBulkActions
        selectedCount={selectedEmails.size}
        totalCount={displayEmails.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onMarkAsRead={handleBulkMarkAsRead}
        onMarkAsUnread={handleBulkMarkAsUnread}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onAddLabel={handleAddLabel}
        onStar={() => {}}
        availableLabels={[...labels.map(l => l.name), ...aiCategories.map(c => c.name)]}
        isAllSelected={isAllSelected}
      />

      {/* Email List Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your emails</h3>
          {isGeminiConnected && (
            <p className="text-sm text-blue-600 flex items-center space-x-2">
              <span>✨</span>
              <span>Analyzing with Gemini AI</span>
            </p>
          )}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading emails</h3>
          <p className="text-gray-600 mb-6 text-center text-sm">{error}</p>
          <button 
            onClick={() => refetch()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
          >
            Try Again
          </button>
        </div>
      ) : (
        <EmailList 
          emails={displayEmails} 
          onEmailSelect={handleEmailSelect}
          selectedEmail={selectedEmail}
          selectedEmails={selectedEmails}
          onSelectEmail={handleSelectEmail}
        />
      )}
    </div>
  );
};

export default EmailListSection;
