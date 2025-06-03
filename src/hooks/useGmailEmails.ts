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
      console.log('Fetching emails with Gemini service:', !!geminiService);
      
      // Fetch raw emails first
      const rawEmails = await gmailService.fetchRawEmails();
      console.log('Fetched raw emails:', rawEmails.length);
      
      // Process emails with Gemini if available
      const processedEmails: Email[] = [];
      
      for (const email of rawEmails) {
        let processedEmail = { ...email };
        
        if (geminiService) {
          try {
            console.log(`Analyzing email: ${email.subject}`);
            const analysis = await geminiService.analyzeEmail(
              email.subject, 
              email.body, 
              email.sender
            );
            
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
            
            console.log('Email analysis completed:', analysis);
          } catch (analysisError) {
            console.error('Error analyzing email:', analysisError);
            // Keep the email but with default analysis
            processedEmail = {
              ...email,
              category: 'Personal',
              summary: 'Unable to generate summary at this time',
              priority: 'medium'
            };
          }
        } else {
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
      
      setEmails(processedEmails);
      
      // Extract tasks from AI-analyzed emails if Gemini is connected and auto-create is enabled
      if (geminiService && autoCreateTasks) {
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
        
        setTasks(extractedTasks);
        console.log('Extracted tasks from AI analysis:', extractedTasks.length);
      }
    } catch (err: any) {
      console.error('Error in fetchEmails:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
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
