
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

  const login = () => {
    gmailService.login();
  };

  const logout = () => {
    gmailService.logout();
    setAuth({
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  return {
    ...auth,
    login,
    logout
  };
};
