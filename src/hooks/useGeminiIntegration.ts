
import { useState, useEffect } from 'react';
import { geminiService, GeminiService } from '../services/geminiService';

export const useGeminiIntegration = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [service, setService] = useState<GeminiService | null>(null);

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setService(geminiService.create(storedKey));
      setIsValidated(true);
    }
  }, []);

  const validateAndSaveApiKey = async (key: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      const isValid = await geminiService.validateApiKey(key);
      if (isValid) {
        setApiKey(key);
        setIsValidated(true);
        setService(geminiService.create(key));
        localStorage.setItem('gemini_api_key', key);
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
    localStorage.removeItem('gemini_api_key');
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
