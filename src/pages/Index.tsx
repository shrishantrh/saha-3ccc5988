import React, { useState, useEffect } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle, X, MoreHorizontal, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import TaskPanel from '../components/TaskPanel';
import ReplyInterface from '../components/ReplyInterface';
import { Email, Task } from '../types';
import { useGmailAuth } from '../hooks/useGmailAuth';
import { useGmailEmails } from '../hooks/useGmailEmails';
import { useGroqIntegration } from '../hooks/useGroqIntegration';

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
    read: false
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
    read: true
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
    read: true
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
    daysLeft: 2
  },
  {
    id: '2',
    emailId: '2',
    title: 'Schedule meeting with Prof. Johnson',
    dueDate: '2024-05-27',
    priority: 'medium',
    completed: false,
    daysLeft: 4
  },
  {
    id: '3',
    emailId: '3',
    title: 'Register for AI Summit 2024',
    dueDate: '2024-05-26',
    priority: 'low',
    completed: false,
    daysLeft: 3
  }
];

const Index = () => {
  const { isAuthenticated } = useGmailAuth();
  const { service: groqService, isValidated: isGroqConnected } = useGroqIntegration();
  const { emails: gmailEmails, tasks: aiTasks, isLoading, error, refetch } = useGmailEmails(groqService);
  
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [replyTo, setReplyTo] = useState<Email | null>(null);

  // Update emails and tasks when Gmail emails change
  useEffect(() => {
    if (isAuthenticated && gmailEmails.length > 0) {
      setEmails(gmailEmails);
      // Clear selection when emails change
      setSelectedEmail(null);
      
      // Use AI-generated tasks if available, otherwise fallback to mock
      if (isGroqConnected && aiTasks.length > 0) {
        setTasks(aiTasks);
        console.log('Using AI-generated tasks:', aiTasks.length);
      }
    }
  }, [isAuthenticated, gmailEmails, aiTasks, isGroqConnected]);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    setReplyTo(email);
    
    // Mark as read
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, read: true } : e
    ));
  };

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

  const handleSendReply = async (message: string) => {
    if (replyTo) {
      console.log(`Sending reply to ${replyTo.sender}: ${message}`);
      // Here you would integrate with Gmail API for sending
      setReplyTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Saha
            </h1>
            <span className="text-sm text-slate-500 font-medium">
              Intelligent Email Assistant
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            {isAuthenticated ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected to Gmail</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Not connected</span>
              </div>
            )}

            {isGroqConnected ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI Active</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>AI Disabled</span>
              </div>
            )}

            <Link 
              to="/settings" 
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {isAuthenticated ? (
        <>
          {/* Main Layout */}
          <div className="flex h-[calc(100vh-80px)]">
            {/* Email List Panel */}
            <div className="w-96 bg-white/60 backdrop-blur-sm border-r border-slate-200">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600">Loading emails...</p>
                  {isGroqConnected && (
                    <p className="text-xs text-slate-500 mt-2">Analyzing with AI...</p>
                  )}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-slate-800 font-medium mb-2">Error loading emails</p>
                  <p className="text-slate-600 mb-4 text-center">{error}</p>
                  <button 
                    onClick={() => refetch()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <EmailList 
                  emails={emails} 
                  onEmailSelect={handleEmailSelect}
                  selectedEmail={selectedEmail}
                />
              )}
            </div>

            {/* Email Detail Panel */}
            <div className="flex-1 bg-white/40 backdrop-blur-sm">
              {selectedEmail ? (
                <EmailDetail 
                  email={selectedEmail} 
                  onReply={() => setReplyTo(selectedEmail)}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select an email</h3>
                    <p className="text-sm">Choose an email from the list to view details</p>
                  </div>
                </div>
              )}
            </div>

            {/* Task Panel */}
            <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-slate-200">
              <TaskPanel 
                tasks={tasks}
                emails={emails}
                onTaskComplete={handleTaskComplete}
                onTaskDelete={handleTaskDelete}
                onTaskPriorityChange={handleTaskPriorityChange}
                onEmailSelect={handleEmailSelect}
              />
            </div>
          </div>

          {/* Reply Interface */}
          {replyTo && (
            <ReplyInterface 
              email={replyTo}
              onSend={handleSendReply}
              onCancel={() => setReplyTo(null)}
            />
          )}
        </>
      ) : (
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Connect to Gmail to get started
          </h2>
          
          <p className="text-slate-600 max-w-md text-center mb-8">
            Saha needs to connect to your Gmail account to fetch emails, generate summaries, and extract tasks.
          </p>
          
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Go to Settings</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
