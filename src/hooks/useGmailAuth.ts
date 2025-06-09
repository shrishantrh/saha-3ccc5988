
import { useState, useEffect } from 'react';
import { GmailAuth } from '../types';
import { gmailService } from '../services/gmailService';

export const useGmailAuth = () => {
  const [auth, setAuth] = useState<GmailAuth>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const isAuthenticated = gmailService.checkAuth();
        setAuth({
          isAuthenticated,
          isLoading: false,
          error: null
        });
      } catch (error: any) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          error: error.message
        });
      }
    };

    checkAuthentication();
  }, []);

  const login = async () => {
    console.log('Login button clicked, starting authentication...');
    setAuth(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await gmailService.login();
      console.log('Login successful, updating auth state');
      setAuth({
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        error: error.message
      });
    }
  };

  const logout = async () => {
    try {
      await gmailService.logout();
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        error: error.message
      });
    }
  };

  return {
    ...auth,
    login,
    logout
  };
};
