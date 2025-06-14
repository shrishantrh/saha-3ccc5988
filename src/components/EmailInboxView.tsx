
import React from 'react';
import CalendarView from './CalendarView';
import EmailComposer from './EmailComposer';
import ReplyInterface from './ReplyInterface';
import EmailChat from './EmailChat';
import EmailMainContent from './EmailMainContent';
import { Email, Task } from '../types';

interface EmailInboxViewProps {
  currentView: 'email' | 'calendar';
  isGeminiConnected: boolean;
  // Email Main Content props
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
  // Modal/interface props
  isComposerOpen: boolean;
  setIsComposerOpen: (open: boolean) => void;
  handleSendEmail: (emailData: any) => void;
  replyTo: Email | null;
  setReplyTo: (email: Email | null) => void;
  handleSendReply: (message: string) => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  geminiService: any;
}

const EmailInboxView: React.FC<EmailInboxViewProps> = ({
  currentView,
  isGeminiConnected,
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
  handleEmailSelect,
  selectedEmail,
  handleSelectEmail,
  handleReplyClick,
  tasks,
  emails,
  handleTaskComplete,
  handleTaskDelete,
  handleTaskPriorityChange,
  handleTaskDateChange,
  isComposerOpen,
  setIsComposerOpen,
  handleSendEmail,
  replyTo,
  setReplyTo,
  handleSendReply,
  isChatOpen,
  setIsChatOpen,
  geminiService
}) => {
  return (
    <>
      {currentView === 'email' ? (
        <EmailMainContent
          isLabelsVisible={isLabelsVisible}
          labels={labels}
          aiCategories={aiCategories}
          onCreateLabel={onCreateLabel}
          onDeleteLabel={onDeleteLabel}
          onEditLabel={onEditLabel}
          onFilterByLabel={onFilterByLabel}
          selectedLabel={selectedLabel}
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
          handleReplyClick={handleReplyClick}
          tasks={tasks}
          emails={emails}
          handleTaskComplete={handleTaskComplete}
          handleTaskDelete={handleTaskDelete}
          handleTaskPriorityChange={handleTaskPriorityChange}
          handleTaskDateChange={handleTaskDateChange}
        />
      ) : (
        <div className="h-[calc(100vh-120px)]">
          <CalendarView tasks={tasks} />
        </div>
      )}

      {/* Email Composer */}
      <EmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSend={handleSendEmail}
        replyTo={replyTo ? { to: replyTo.sender, subject: replyTo.subject } : undefined}
      />

      {/* Reply Interface */}
      {replyTo && (
        <ReplyInterface 
          email={replyTo}
          onSend={handleSendReply}
          onCancel={() => setReplyTo(null)}
        />
      )}

      {/* AI Chat Interface */}
      <EmailChat
        geminiService={geminiService}
        emails={emails}
        tasks={tasks}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default EmailInboxView;
