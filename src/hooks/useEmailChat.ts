
import { useState } from 'react';
import { Email } from '../types';
import { GeminiService } from '../services/geminiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isRetrying?: boolean;
}

export const useEmailChat = (geminiService: GeminiService | null, emails: Email[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  const generateSmartSuggestions = async () => {
    if (!geminiService || emails.length === 0) return;

    try {
      const emailContext = emails.slice(0, 10).map(email => ({
        subject: email.subject,
        sender: email.sender,
        timestamp: email.timestamp,
        snippet: email.snippet,
        category: email.category || 'Personal',
        priority: email.priority || 'medium',
        summary: email.summary || 'No summary available',
        tasks: email.aiAnalysis?.tasks || [],
        sentiment: (email.aiAnalysis as any)?.sentiment,
        urgency: (email.aiAnalysis as any)?.urgency
      }));

      const suggestions = await geminiService.generateSmartSuggestions(emailContext);
      setSmartSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!geminiService || !userMessage.trim()) return;

    const userChatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);

    try {
      console.log('Starting email search with message:', userMessage);
      console.log('Number of emails to search:', emails.length);
      
      const emailContext = emails.slice(0, 20).map(email => ({
        subject: email.subject,
        sender: email.sender,
        timestamp: email.timestamp,
        snippet: email.snippet,
        category: email.category || 'Personal',
        priority: email.priority || 'medium',
        summary: email.summary || 'No summary available',
        tasks: email.aiAnalysis?.tasks || [],
        sentiment: (email.aiAnalysis as any)?.sentiment,
        urgency: (email.aiAnalysis as any)?.urgency
      }));

      console.log('Email context prepared:', emailContext.length, 'emails');

      const response = await geminiService.searchEmails(userMessage, emailContext);
      console.log('Gemini API response received:', response.substring(0, 100) + '...');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Detailed error in email chat:', error);
      
      let errorContent = 'I encountered an error while searching your emails. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Rate limit exceeded')) {
          errorContent = 'I hit the API rate limit. Please wait a moment and try again.';
        } else if (error.message.includes('429')) {
          errorContent = 'API rate limit reached. Please wait about 30 seconds before trying again.';
        } else {
          errorContent = `I encountered an error: ${error.message}. Please check your Gemini API connection and try again.`;
        }
      }
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    smartSuggestions,
    generateSmartSuggestions
  };
};
