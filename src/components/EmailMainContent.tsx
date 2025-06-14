
import React from 'react';
import EmailMainSidebar from './EmailMainSidebar';
import EmailListSection from './EmailListSection';
import EmailDetailSection from './EmailDetailSection';
import TaskPanelSection from './TaskPanelSection';
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
      <EmailMainSidebar
        isLabelsVisible={isLabelsVisible}
        labels={labels}
        aiCategories={aiCategories}
        onCreateLabel={onCreateLabel}
        onDeleteLabel={onDeleteLabel}
        onEditLabel={onEditLabel}
        onFilterByLabel={onFilterByLabel}
        selectedLabel={selectedLabel}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Email List */}
        <EmailListSection
          displayEmails={displayEmails}
          selectedEmails={selectedEmails}
          handleSelectAll={handleSelectAll}
          handleDeselectAll={handleDeselectAll}
          handleBulkMarkAsRead={handleBulkMarkAsRead}
          handleBulkMarkAsUnread={handleBulkMarkAsUnread}
          handleBulkArchive={handleBulkArchive}
          handleBulkDelete={handleBulkDelete}
          handleAddLabel={handleAddLabel}
          isAllSelected={isAllSelected}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          isGeminiConnected={isGeminiConnected}
          handleEmailSelect={handleEmailSelect}
          selectedEmail={selectedEmail}
          handleSelectEmail={handleSelectEmail}
          labels={labels}
          aiCategories={aiCategories}
        />

        {/* Email Detail */}
        <EmailDetailSection
          selectedEmail={selectedEmail}
          handleReplyClick={handleReplyClick}
        />

        {/* Task Panel */}
        <TaskPanelSection
          tasks={tasks}
          emails={emails}
          handleTaskComplete={handleTaskComplete}
          handleTaskDelete={handleTaskDelete}
          handleTaskPriorityChange={handleTaskPriorityChange}
          handleTaskDateChange={handleTaskDateChange}
          handleEmailSelect={handleEmailSelect}
        />
      </div>
    </div>
  );
};

export default EmailMainContent;
