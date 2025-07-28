import React, { useState, useEffect } from 'react';
import EmailViewHeader from '../components/EmailViewHeader';
import EmailInboxView from '../components/EmailInboxView';
import WelcomeScreen from '../components/WelcomeScreen';
import { Email, Task } from '../types';
import { useGmailAuth } from '../hooks/useGmailAuth';
import { useGmailEmails } from '../hooks/useGmailEmails';
import { useGeminiIntegration } from '../hooks/useGeminiIntegration';
import { gmailService } from '../services/gmailService';

// Mock data for demonstration when not connected to Gmail
const mockEmails: Email[] = [
  {
    id: '1',
    sender: 'admissions@stanford.edu',
    subject: 'Application Status Update - Important',
    snippet: 'Your application has been received and is currently under review...',
    body: 'Dear Applicant,\n\nWe are pleased to inform you that your application has been received and is currently under review by our admissions committee. Please ensure all supporting documents are submitted by the deadline.\n\nBest regards,\nStanford Admissions',
    category: 'Admissions',
    summary: 'Stanford confirms application received, reminds about document deadline',
    timestamp: '2 hours ago',
    priority: 'high',
    read: false,
    labels: ['Important', 'Deadline']
  },
  {
    id: '2',
    sender: 'prof.johnson@university.edu',
    subject: 'Research Collaboration Opportunity',
    snippet: 'I would like to discuss a potential research collaboration...',
    body: 'Hello,\n\nI hope this email finds you well. I would like to discuss a potential research collaboration on machine learning applications in healthcare. Are you available for a meeting next week?\n\nBest,\nProf. Johnson',
    category: 'Academic',
    summary: 'Professor proposing ML healthcare research collaboration, requesting meeting',
    timestamp: '5 hours ago',
    priority: 'medium',
    read: true,
    labels: ['Work', 'Research']
  },
  {
    id: '3',
    sender: 'events@techconference.com',
    subject: 'AI Summit 2024 - Early Bird Registration',
    snippet: 'Register now for the premier AI conference...',
    body: 'The AI Summit 2024 is approaching fast! Early bird registration ends in 3 days. Don\'t miss out on this opportunity to learn from industry leaders.\n\nRegister now to secure your spot.',
    category: 'Events',
    summary: 'AI conference early bird registration ending soon (3 days)',
    timestamp: '1 day ago',
    priority: 'low',
    read: true,
    labels: ['Events', 'Personal']
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    emailId: '1',
    title: 'Submit supporting documents to Stanford',
    dueDate: '2024-05-25',
    priority: 'high',
    completed: false,
    daysLeft: 2,
    label: 'deadline-approaching'
  },
  {
    id: '2',
    emailId: '2',
    title: 'Schedule meeting with Prof. Johnson',
    dueDate: '2024-05-27',
    priority: 'medium',
    completed: false,
    daysLeft: 4,
    label: 'meeting-scheduled'
  },
  {
    id: '3',
    emailId: '3',
    title: 'Register for AI Summit 2024',
    dueDate: '2024-05-26',
    priority: 'low',
    completed: false,
    daysLeft: 3,
    label: 'follow-up'
  }
];

const Index = () => {
  const { isAuthenticated } = useGmailAuth();
  const { service: geminiService, isValidated: isGeminiConnected } = useGeminiIntegration();
  const { emails: gmailEmails, tasks: aiTasks, isLoading, error, refetch } = useGmailEmails(geminiService);
  
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [replyTo, setReplyTo] = useState<Email | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [smartReplyOpen, setSmartReplyOpen] = useState<Email | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [labels, setLabels] = useState([
    { id: '1', name: 'Important', color: '#ef4444', count: 2 },
    { id: '2', name: 'Work', color: '#3b82f6', count: 1 },
    { id: '3', name: 'Personal', color: '#22c55e', count: 1 },
    { id: '4', name: 'Research', color: '#8b5cf6', count: 1 },
    { id: '5', name: 'Events', color: '#eab308', count: 1 },
    { id: '6', name: 'Deadline', color: '#dc2626', count: 1 }
  ]);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isLabelsVisible, setIsLabelsVisible] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Generate AI categories from emails and ensure they're applied as labels
  const aiCategories = React.useMemo(() => {
    const categoryCount: { [key: string]: number } = {};
    emails.forEach(email => {
      if (email.category) {
        categoryCount[email.category] = (categoryCount[email.category] || 0) + 1;
      }
    });

    const categoryColors: { [key: string]: string } = {
      'Academic': '#3b82f6',
      'Admissions': '#8b5cf6',
      'Events': '#22c55e',
      'Personal': '#f97316',
      'Work': '#ef4444',
      'Finance': '#10b981',
      'Travel': '#06b6d4',
      'Shopping': '#ec4899',
      'Social': '#8b5cf6',
      'Health': '#f43f5e',
      'Legal': '#6b7280',
      'Technology': '#6366f1'
    };

    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      color: categoryColors[name] || '#6b7280'
    }));
  }, [emails]);

  // Update emails and tasks when Gmail emails change OR when Gemini connection changes
  useEffect(() => {
    console.log('Index useEffect triggered - authenticated:', isAuthenticated, 'gmailEmails:', gmailEmails.length, 'geminiConnected:', isGeminiConnected);
    
    if (isAuthenticated && gmailEmails.length > 0) {
      console.log('Updating emails with Gmail data');
      // Apply AI category as label and add any existing custom labels
      const emailsWithLabels = gmailEmails.map(email => {
        const existingLabels = (email as any).labels || [];
        const categoryLabel = email.category ? [email.category] : [];
        return {
          ...email,
          labels: [...new Set([...categoryLabel, ...existingLabels])]
        };
      });
      setEmails(emailsWithLabels);
      setSelectedEmail(null);
      
      if (isGeminiConnected && aiTasks.length > 0) {
        console.log('Updating tasks with AI-generated tasks:', aiTasks.length);
        setTasks(aiTasks);
      }
    }
  }, [isAuthenticated, gmailEmails, aiTasks, isGeminiConnected]);

  // Trigger refetch when Gemini service becomes available
  useEffect(() => {
    console.log('Gemini service effect - isAuthenticated:', isAuthenticated, 'geminiService available:', !!geminiService);
    if (isAuthenticated && geminiService) {
      console.log('Gemini service became available, triggering email refetch');
      refetch();
    }
  }, [geminiService, isAuthenticated, refetch]);

  useEffect(() => {
    // Apply filters and label selection
    let filtered = emails;
    
    if (selectedLabel) {
      // Filter by AI category or custom label
      filtered = emails.filter(email => {
        // Check AI category
        if (email.category === selectedLabel) return true;
        // Check custom labels
        return (email as any).labels?.includes(selectedLabel);
      });
    }
    
    setFilteredEmails(filtered);
  }, [emails, selectedLabel]);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, read: true } : e
    ));
  };

  const handleReplyClick = (email: Email) => {
    setSmartReplyOpen(email);
  };

  const handleSmartReply = (email: Email) => {
    setSmartReplyOpen(email);
  };

  const handleCompose = () => {
    setIsComposerOpen(true);
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      if (isAuthenticated) {
        await gmailService.sendEmail(emailData.to, emailData.subject, emailData.body);
      }
      console.log('Email sent:', emailData);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleSearch = (filters: any) => {
    let filtered = emails;
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query)
      );
    }
    
    if (filters.sender) {
      filtered = filtered.filter(email =>
        email.sender.toLowerCase().includes(filters.sender.toLowerCase())
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(email => email.category === filters.category);
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(email => email.priority === filters.priority);
    }
    
    if (filters.isUnread) {
      filtered = filtered.filter(email => !email.read);
    }
    
    setFilteredEmails(filtered);
  };

  const handleClearSearch = () => {
    setFilteredEmails([]);
    setSelectedLabel('');
  };

  // Bulk Actions - Fixed checkbox handling
  const handleSelectEmail = (emailId: string) => {
    console.log('handleSelectEmail called with:', emailId);
    setSelectedEmails(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(emailId)) {
        newSelected.delete(emailId);
        console.log('Removed email from selection:', emailId);
      } else {
        newSelected.add(emailId);
        console.log('Added email to selection:', emailId);
      }
      console.log('New selected emails:', Array.from(newSelected));
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const emailsToSelect = filteredEmails.length > 0 ? filteredEmails : emails;
    setSelectedEmails(new Set(emailsToSelect.map(email => email.id)));
    console.log('Selected all emails:', emailsToSelect.length);
  };

  const handleDeselectAll = () => {
    setSelectedEmails(new Set());
    console.log('Deselected all emails');
  };

  const handleBulkMarkAsRead = () => {
    setEmails(prev => prev.map(email => 
      selectedEmails.has(email.id) ? { ...email, read: true } : email
    ));
    setSelectedEmails(new Set());
  };

  const handleBulkMarkAsUnread = () => {
    setEmails(prev => prev.map(email => 
      selectedEmails.has(email.id) ? { ...email, read: false } : email
    ));
    setSelectedEmails(new Set());
  };

  const handleBulkArchive = () => {
    setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
    setSelectedEmails(new Set());
  };

  const handleBulkDelete = () => {
    setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
    setTasks(prev => prev.filter(task => !selectedEmails.has(task.emailId)));
    setSelectedEmails(new Set());
  };

  const handleAddLabel = (labelName: string) => {
    if (!labelName) return;
    
    console.log('Adding label', labelName, 'to emails:', Array.from(selectedEmails));
    
    setEmails(prev => prev.map(email => {
      if (selectedEmails.has(email.id)) {
        const emailLabels = (email as any).labels || [];
        if (!emailLabels.includes(labelName)) {
          console.log('Adding label', labelName, 'to email', email.id);
          return { ...email, labels: [...emailLabels, labelName] };
        }
      }
      return email;
    }));
    
    // Update label counts
    updateLabelCounts();
    setSelectedEmails(new Set());
  };

  // Label Management
  const updateLabelCounts = () => {
    setLabels(prev => prev.map(label => ({
      ...label,
      count: emails.filter(email => (email as any).labels?.includes(label.name)).length
    })));
  };

  const handleCreateLabel = (name: string, color: string) => {
    const newLabel = {
      id: Date.now().toString(),
      name,
      color,
      count: 0
    };
    setLabels(prev => [...prev, newLabel]);
  };

  const handleDeleteLabel = (labelId: string) => {
    const labelToDelete = labels.find(l => l.id === labelId);
    if (labelToDelete) {
      // Remove label from all emails
      setEmails(prev => prev.map(email => ({
        ...email,
        labels: (email as any).labels?.filter((l: string) => l !== labelToDelete.name) || []
      })));
      setLabels(prev => prev.filter(label => label.id !== labelId));
      if (selectedLabel === labelToDelete.name) {
        setSelectedLabel('');
      }
    }
  };

  const handleEditLabel = (labelId: string, name: string, color: string) => {
    const oldLabel = labels.find(l => l.id === labelId);
    if (oldLabel) {
      // Update label in all emails
      setEmails(prev => prev.map(email => ({
        ...email,
        labels: (email as any).labels?.map((l: string) => l === oldLabel.name ? name : l) || []
      })));
      setLabels(prev => prev.map(label => 
        label.id === labelId ? { ...label, name, color } : label
      ));
      if (selectedLabel === oldLabel.name) {
        setSelectedLabel(name);
      }
    }
  };

  const handleFilterByLabel = (labelName: string) => {
    console.log('Filtering by label:', labelName);
    setSelectedLabel(labelName);
  };

  // Task handlers
  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTaskPriorityChange = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const priorities = ['low', 'medium', 'high'] as const;
        const currentIndex = priorities.indexOf(task.priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        return { ...task, priority: priorities[nextIndex] };
      }
      return task;
    }));
  };

  const handleTaskDateChange = (taskId: string, newDate: Date) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const timeDiff = newDate.getTime() - new Date().getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return { 
          ...task, 
          dueDate: newDate.toISOString().split('T')[0],
          daysLeft: Math.max(0, daysLeft)
        };
      }
      return task;
    }));
  };

  const handleSendReply = async (message: string) => {
    if (replyTo) {
      console.log(`Sending reply to ${replyTo.sender}: ${message}`);
      setReplyTo(null);
    }
  };

  const handleSendSmartReply = async (message: string) => {
    if (smartReplyOpen) {
      try {
        if (isAuthenticated) {
          await gmailService.sendEmail(
            smartReplyOpen.sender, 
            `Re: ${smartReplyOpen.subject}`, 
            message
          );
        }
        console.log(`Sending smart reply to ${smartReplyOpen.sender}: ${message}`);
        setSmartReplyOpen(null);
      } catch (error) {
        console.error('Failed to send smart reply:', error);
      }
    }
  };

  const categories = [...new Set(emails.map(email => email.category))];
  const displayEmails = filteredEmails.length > 0 || selectedLabel ? filteredEmails : emails;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EmailViewHeader
        isAuthenticated={isAuthenticated}
        isGeminiConnected={isGeminiConnected}
        showSearchBar={showSearchBar}
        setShowSearchBar={setShowSearchBar}
        isLabelsVisible={isLabelsVisible}
        setIsLabelsVisible={setIsLabelsVisible}
        handleCompose={handleCompose}
        setIsChatOpen={setIsChatOpen}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        categories={categories}
        labels={labels}
      />

      {isAuthenticated ? (
        <EmailInboxView
          isGeminiConnected={isGeminiConnected}
          isLabelsVisible={isLabelsVisible}
          labels={labels}
          aiCategories={aiCategories}
          onCreateLabel={handleCreateLabel}
          onDeleteLabel={handleDeleteLabel}
          onEditLabel={handleEditLabel}
          onFilterByLabel={handleFilterByLabel}
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
          isAllSelected={selectedEmails.size === displayEmails.length && displayEmails.length > 0}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          handleEmailSelect={handleEmailSelect}
          selectedEmail={selectedEmail}
          handleSelectEmail={handleSelectEmail}
          handleReplyClick={handleReplyClick}
          handleSmartReply={handleSmartReply}
          tasks={tasks}
          emails={emails}
          handleTaskComplete={handleTaskComplete}
          handleTaskDelete={handleTaskDelete}
          handleTaskPriorityChange={handleTaskPriorityChange}
          handleTaskDateChange={handleTaskDateChange}
          isComposerOpen={isComposerOpen}
          setIsComposerOpen={setIsComposerOpen}
          handleSendEmail={handleSendEmail}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          handleSendReply={handleSendReply}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          geminiService={geminiService}
          smartReplyOpen={smartReplyOpen}
          setSmartReplyOpen={setSmartReplyOpen}
          handleSendSmartReply={handleSendSmartReply}
        />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default Index;
