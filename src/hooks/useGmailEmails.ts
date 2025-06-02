
import { useEffect, useState } from 'react';
import { Email } from '../types';
import { gmailService } from '../services/gmailService';
import { GroqService } from '../services/groqService';

export const useGmailEmails = (groqService?: GroqService) => {
  const [emails, setEmails] = useState<Email[]>([]);
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
      console.log('Fetching emails with Groq service:', !!groqService);
      const fetchedEmails = await gmailService.fetchEmails(groqService);
      setEmails(fetchedEmails);
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
  }, [groqService]); // Re-fetch when groqService changes
  
  // Return data and refetch function
  return {
    emails,
    isLoading,
    error,
    refetch: fetchEmails
  };
};
