
import React from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import TaskPanel from './TaskPanel';
import EmailBulkActions from './EmailBulkActions';
import EmailLabels from './EmailLabels';
import { Email, Task } from '../types';

interface EmailMainContentProps {
  isLabelsVisible: boolean;
  labels: Array<{ id: string; name: string; color: string; count: number }>;
  aiCategories: Array<{ name: string; count: number; color: string }>;
  onCreateLabel: (name: string, color: string) => void;
  onDeleteLabel: (labelId: string) => void;
  onEditLabel: (labelId: string, name: string, color: string) => void;
  onFilterByLabel: (labelName: string) => void;
  selectedLabel: string;
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
  handleReplyClick: (email: Email) => void;
  tasks: Task[];
  emails: Email[];
  handleTaskComplete: (taskId: string) => void;
  handleTaskDelete: (taskId: string) => void;
  handleTaskPriorityChange: (taskId: string) => void;
  handleTaskDateChange: (taskId: string, newDate: Date) => void;
}

const EmailMainContent: React.FC<EmailMainContentProps> = ({
  isLabelsVisible,
  labels,
  aiCategories,
  onCreateLabel,
  onDeleteLabel,
  onEditLabel,
  onFilterByLabel,
  selectedLabel,
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
  handleReplyClick,
  tasks,
  emails,
  handleTaskComplete,
  handleTaskDelete,
  handleTaskPriorityChange,
  handleTaskDateChange
}) => {
  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Collapsible Labels Panel */}
      {isLabelsVisible && (
        <div className="w-64 bg-white border-r border-gray-200 animate-slide-in-right">
          <EmailLabels
            labels={labels}
            onCreateLabel={onCreateLabel}
            onDeleteLabel={onDeleteLabel}
            onEditLabel={onEditLabel}
            onFilterByLabel={onFilterByLabel}
            selectedLabel={selectedLabel}
            aiCategories={aiCategories}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Email List */}
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

        {/* Email Detail */}
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

        {/* Task Panel */}
        <div className="w-80 bg-white border-l border-gray-200">
          <TaskPanel 
            tasks={tasks}
            emails={emails}
            onTaskComplete={handleTaskComplete}
            onTaskDelete={handleTaskDelete}
            onTaskPriorityChange={handleTaskPriorityChange}
            onEmailSelect={handleEmailSelect}
            onTaskDateChange={handleTaskDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailMainContent;
