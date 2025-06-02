
import { useState } from 'react';
import { Email } from '../types';
import { GroqService } from '../services/groqService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useEmailChat = (groqService: GroqService | null, emails: Email[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    if (!groqService || !userMessage.trim()) return;

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
      
      // Prepare email context for the AI - limit to prevent API issues
      const emailContext = emails.slice(0, 20).map(email => ({
        subject: email.subject,
        sender: email.sender,
        timestamp: email.timestamp,
        snippet: email.snippet,
        category: email.category || 'Personal',
        priority: email.priority || 'medium',
        summary: email.summary || 'No summary available',
        tasks: email.aiAnalysis?.tasks || []
      }));

      console.log('Email context prepared:', emailContext.length, 'emails');

      const response = await groqService.searchEmails(userMessage, emailContext);
      console.log('Groq API response received:', response.substring(0, 100) + '...');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Detailed error in email chat:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I encountered an error while searching your emails: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your Groq API connection and try again.`,
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
    clearChat
  };
};
