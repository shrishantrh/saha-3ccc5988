import React, { useState, useEffect } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle, X, MoreHorizontal, Settings as SettingsIcon, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import TaskPanel from '../components/TaskPanel';
import ReplyInterface from '../components/ReplyInterface';
import EmailChat from '../components/EmailChat';
import { Email, Task } from '../types';
import { useGmailAuth } from '../hooks/useGmailAuth';
import { useGmailEmails } from '../hooks/useGmailEmails';
import { useGeminiIntegration } from '../hooks/useGeminiIntegration';

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

  // Update emails and tasks when Gmail emails change OR when Gemini connection changes
  useEffect(() => {
    console.log('Index useEffect triggered - authenticated:', isAuthenticated, 'gmailEmails:', gmailEmails.length, 'geminiConnected:', isGeminiConnected);
    
    if (isAuthenticated && gmailEmails.length > 0) {
      console.log('Updating emails with Gmail data');
      setEmails(gmailEmails);
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

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    // Reply interface will only open when explicitly requested via handleReplyClick
    
    // Mark as read
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, read: true } : e
    ));
  };

  const handleReplyClick = (email: Email) => {
    setReplyTo(email);
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
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
      setReplyTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Saha
              </h1>
              <span className="text-sm text-slate-500 font-medium">
                AI-Powered Email Intelligence
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Gmail Connected</span>
            </div>

            <div className="flex items-center space-x-2">
              {isGeminiConnected && (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  title="AI Chat Assistant"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}

              <Link 
                to="/settings" 
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {isAuthenticated ? (
        <>
          {/* Main Layout */}
          <div className="flex h-[calc(100vh-88px)]">
            {/* Email List Panel - Fixed width */}
            <div className="w-96 bg-white/70 backdrop-blur-sm border-r border-slate-200 shadow-sm">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-700 font-medium">Loading emails...</p>
                  {isGeminiConnected && (
                    <p className="text-sm text-purple-600 mt-2">✨ Analyzing with Gemini AI</p>
                  )}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-slate-800 font-medium mb-2">Error loading emails</p>
                  <p className="text-slate-600 mb-4 text-center text-sm">{error}</p>
                  <button 
                    onClick={() => refetch()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
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

            {/* Email Detail Panel - Flexible width with max constraint */}
            <div className="flex-1 bg-white/50 backdrop-blur-sm max-w-4xl">
              {selectedEmail ? (
                <EmailDetail 
                  email={selectedEmail} 
                  onReply={() => handleReplyClick(selectedEmail)}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-800">Select an email</h3>
                    <p className="text-sm text-slate-600">Choose an email from the list to view details and AI insights</p>
                  </div>
                </div>
              )}
            </div>

            {/* Task Panel - Fixed width */}
            <div className="w-80 bg-white/70 backdrop-blur-sm border-l border-slate-200 shadow-sm">
              <TaskPanel 
                tasks={tasks}
                emails={emails}
                onTaskComplete={handleTaskComplete}
                onTaskDelete={handleTaskDelete}
                onTaskPriorityChange={handleTaskPriorityChange}
                onTaskUpdate={handleTaskUpdate}
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
              geminiService={geminiService}
            />
          )}

          {/* AI Chat Interface */}
          <EmailChat
            geminiService={geminiService}
            emails={emails}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </>
      ) : (
        <div className="h-[calc(100vh-88px)] flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <Mail className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">
            Connect to Gmail to get started
          </h2>
          
          <p className="text-slate-600 max-w-lg text-center mb-8 leading-relaxed">
            Saha uses advanced AI to analyze your emails, extract tasks, and provide intelligent insights. 
            Connect your Gmail account to experience the future of email management.
          </p>
          
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Connect Gmail Account</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
