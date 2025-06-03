
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
      const fetchedEmails = await gmailService.fetchEmails(geminiService);
      setEmails(fetchedEmails);
      
      // Extract tasks from AI-analyzed emails if Gemini is connected and auto-create is enabled
      if (geminiService && autoCreateTasks) {
        const extractedTasks: Task[] = [];
        
        for (const email of fetchedEmails) {
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
