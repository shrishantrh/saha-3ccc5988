import React, { useState, useEffect } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle, X, MoreHorizontal, Settings as SettingsIcon, MessageCircle, Calendar, Edit, Plus, Filter, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import TaskPanel from '../components/TaskPanel';
import CalendarPanel from '../components/CalendarPanel';
import CalendarView from '../components/CalendarView';
import ReplyInterface from '../components/ReplyInterface';
import EmailChat from '../components/EmailChat';
import EmailComposer from '../components/EmailComposer';
import EmailSearch from '../components/EmailSearch';
import EmailBulkActions from '../components/EmailBulkActions';
import EmailLabels from '../components/EmailLabels';
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
  const [currentView, setCurrentView] = useState<'email' | 'calendar'>('email');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
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

  // Generate AI categories from emails
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
      // Add mock labels to Gmail emails for demonstration
      const emailsWithLabels = gmailEmails.map(email => ({
        ...email,
        labels: generateAILabels(email)
      }));
      setEmails(emailsWithLabels);
      setSelectedEmail(null);
      
      if (isGeminiConnected && aiTasks.length > 0) {
        console.log('Updating tasks with AI-generated tasks:', aiTasks.length);
        setTasks(aiTasks);
      }
    }
  }, [isAuthenticated, gmailEmails, aiTasks, isGeminiConnected]);

  // AI label generation function
  const generateAILabels = (email: Email): string[] => {
    const labels = [];
    
    // Priority-based labels
    if (email.priority === 'high') labels.push('Important');
    
    // Category-based labels
    if (email.category === 'Academic' || email.category === 'Work') labels.push('Work');
    if (email.category === 'Personal') labels.push('Personal');
    if (email.category === 'Events') labels.push('Events');
    
    // Content-based labels
    const content = (email.subject + ' ' + email.snippet).toLowerCase();
    if (content.includes('deadline') || content.includes('urgent')) labels.push('Deadline');
    if (content.includes('research') || content.includes('collaboration')) labels.push('Research');
    if (content.includes('meeting') || content.includes('appointment')) labels.push('Meeting');
    
    return [...new Set(labels)]; // Remove duplicates
  };

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
    setReplyTo(email);
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

  // Bulk Actions
  const handleSelectEmail = (emailId: string) => {
    console.log('handleSelectEmail called with:', emailId);
    setSelectedEmails(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(emailId)) {
        newSelected.delete(emailId);
      } else {
        newSelected.add(emailId);
      }
      console.log('New selected emails:', newSelected);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    setSelectedEmails(new Set(filteredEmails.map(email => email.id)));
  };

  const handleDeselectAll = () => {
    setSelectedEmails(new Set());
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
    
    setEmails(prev => prev.map(email => {
      if (selectedEmails.has(email.id)) {
        const emailLabels = (email as any).labels || [];
        if (!emailLabels.includes(labelName)) {
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

  const categories = [...new Set(emails.map(email => email.category))];
  const displayEmails = filteredEmails.length > 0 || selectedLabel ? filteredEmails : emails;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Saha
              </h1>
              <span className="text-sm text-gray-500 font-medium">
                AI-Powered Email Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Gmail Connected</span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleCompose}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Edit className="w-4 h-4" />
              <span className="font-medium">Compose</span>
            </button>

            {isGeminiConnected && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                title="AI Assistant"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}

            <Link 
              to="/settings" 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {isAuthenticated ? (
        <>
          {/* Compact Control Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('email')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentView === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Inbox</span>
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentView === 'calendar'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className={`p-2 rounded-lg transition-colors ${
                    showSearchBar 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setIsLabelsVisible(!isLabelsVisible)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLabelsVisible 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Toggle Labels"
                >
                  <Tag className="w-4 h-4" />
                  <span>Labels</span>
                </button>
              </div>
            </div>

            {/* Expandable Search Bar */}
            {showSearchBar && (
              <div className="mt-3 animate-fade-in">
                <EmailSearch
                  onSearch={handleSearch}
                  onClear={() => {
                    handleClearSearch();
                    setShowSearchBar(false);
                  }}
                  categories={categories}
                  labels={labels.map(l => l.name)}
                />
              </div>
            )}
          </div>

          {currentView === 'email' ? (
            <div className="flex h-[calc(100vh-170px)]">
              {/* Collapsible Labels Panel */}
              {isLabelsVisible && (
                <div className="w-64 bg-white border-r border-gray-200 animate-slide-in-right">
                  <EmailLabels
                    labels={labels}
                    onCreateLabel={handleCreateLabel}
                    onDeleteLabel={handleDeleteLabel}
                    onEditLabel={handleEditLabel}
                    onFilterByLabel={handleFilterByLabel}
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
                    onArchive={() => {}}
                    onDelete={handleBulkDelete}
                    onAddLabel={handleAddLabel}
                    onStar={() => {}}
                    availableLabels={labels.map(l => l.name)}
                    isAllSelected={selectedEmails.size === displayEmails.length && displayEmails.length > 0}
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
          ) : (
            <div className="h-[calc(100vh-170px)]">
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
      ) : (
        <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center p-8">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-12 shadow-2xl">
            <Mail className="w-16 h-16 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            The Future of Email
          </h2>
          
          <p className="text-gray-600 max-w-2xl text-center mb-12 text-lg leading-relaxed">
            Experience AI-powered email intelligence that automatically categorizes, 
            extracts tasks, schedules meetings, and provides smart insights. 
            Connect your Gmail to get started.
          </p>
          
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
          >
            <Mail className="w-6 h-6" />
            <span>Connect Gmail Account</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
