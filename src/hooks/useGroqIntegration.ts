
import { useState, useEffect } from 'react';
import { groqService, GroqService } from '../services/groqService';

export const useGroqIntegration = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [service, setService] = useState<GroqService | null>(null);

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedKey = localStorage.getItem('groq_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setService(groqService.create(storedKey));
      setIsValidated(true);
    }
  }, []);

  const validateAndSaveApiKey = async (key: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      const isValid = await groqService.validateApiKey(key);
      if (isValid) {
        setApiKey(key);
        setIsValidated(true);
        setService(groqService.create(key));
        localStorage.setItem('groq_api_key', key);
        return true;
      } else {
        setIsValidated(false);
        return false;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setIsValidated(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setIsValidated(false);
    setService(null);
    localStorage.removeItem('groq_api_key');
  };

  return {
    apiKey,
    isValidated,
    isValidating,
    service,
    validateAndSaveApiKey,
    clearApiKey
  };
};
