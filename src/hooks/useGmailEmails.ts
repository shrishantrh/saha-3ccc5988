import { useEffect, useState } from 'react';
import { Email, Task } from '../types';
import { gmailService } from '../services/gmailService';
import { GeminiService } from '../services/geminiService';

export const useGmailEmails = (geminiService?: GeminiService, autoCreateTasks: boolean = true) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEmails = async () => {
    if (!gmailService.checkAuth()) {
      setError('Not authenticated');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching emails with Gemini service available:', !!geminiService);
      
      // Fetch raw emails first
      const rawEmails = await gmailService.fetchRawEmails();
      console.log('Fetched raw emails:', rawEmails.length);
      
      // Process emails with Gemini if available
      const processedEmails: Email[] = [];
      
      for (const email of rawEmails) {
        let processedEmail = { ...email };
        
        if (geminiService) {
          try {
            console.log(`Analyzing email with Gemini: ${email.subject}`);
            const analysis = await geminiService.analyzeEmail(
              email.subject, 
              email.body, 
              email.sender
            );
            
            console.log('Gemini analysis result:', analysis);
            
            processedEmail = {
              ...email,
              category: analysis.category,
              summary: analysis.summary,
              priority: analysis.priority,
              aiAnalysis: {
                summary: analysis.summary,
                category: analysis.category,
                priority: analysis.priority,
                tasks: analysis.tasks,
                sentiment: analysis.sentiment,
                urgency: analysis.urgency,
                actionRequired: analysis.actionRequired,
                estimatedResponseTime: analysis.estimatedResponseTime
              }
            };
            
            console.log('Email processed successfully with AI analysis');
          } catch (analysisError) {
            console.error('Error analyzing email with Gemini:', analysisError);
            // Keep the email but with default analysis
            processedEmail = {
              ...email,
              category: 'Personal',
              summary: 'Error analyzing email - please check Gemini API key',
              priority: 'medium'
            };
          }
        } else {
          console.log('No Gemini service available, using default analysis');
          // No Gemini service available
          processedEmail = {
            ...email,
            category: 'Personal',
            summary: 'Connect Gemini AI for intelligent analysis',
            priority: 'medium'
          };
        }
        
        processedEmails.push(processedEmail);
      }
      
      console.log('All emails processed, setting state with', processedEmails.length, 'emails');
      setEmails(processedEmails);
      
      // Extract tasks from AI-analyzed emails if Gemini is connected and auto-create is enabled
      if (geminiService && autoCreateTasks) {
        console.log('Extracting tasks from AI analysis...');
        const extractedTasks: Task[] = [];
        
        for (const email of processedEmails) {
          if (email.aiAnalysis?.tasks && email.aiAnalysis.tasks.length > 0) {
            const emailTasks = email.aiAnalysis.tasks.map((task, index) => {
              const dueDate = new Date(task.dueDate);
              const today = new Date();
              const diffTime = dueDate.getTime() - today.getTime();
              const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return {
                id: `${email.id}-task-${index}`,
                emailId: email.id,
                title: task.title,
                dueDate: task.dueDate,
                priority: task.priority,
                completed: false,
                daysLeft: Math.max(0, daysLeft)
              };
            });
            
            extractedTasks.push(...emailTasks);
          }
        }
        
        console.log('Extracted tasks from AI analysis:', extractedTasks.length);
        setTasks(extractedTasks);
      } else {
        console.log('Not extracting tasks - Gemini service not available or auto-create disabled');
      }
    } catch (err: any) {
      console.error('Error in fetchEmails:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('useGmailEmails effect triggered, authenticated:', gmailService.checkAuth(), 'gemini service:', !!geminiService);
    // Only fetch if authenticated
    if (gmailService.checkAuth()) {
      fetchEmails();
    }
  }, [geminiService, autoCreateTasks]);
  
  return {
    emails,
    tasks,
    isLoading,
    error,
    refetch: fetchEmails
  };
};
