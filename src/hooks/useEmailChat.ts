
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
      // Prepare email context for the AI
      const emailContext = emails.map(email => ({
        subject: email.subject,
        sender: email.sender,
        timestamp: email.timestamp,
        snippet: email.snippet,
        category: email.category,
        priority: email.priority,
        summary: email.summary,
        tasks: email.aiAnalysis?.tasks || []
      }));

      const response = await groqService.searchEmails(userMessage, emailContext);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching through your emails. Please try again.',
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
