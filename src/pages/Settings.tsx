
import React from 'react';
import { useGmailAuth } from '../hooks/useGmailAuth';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { isAuthenticated, isLoading, error, login, logout } = useGmailAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-6">
          Settings
        </h1>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Gmail Connection
          </h2>
          
          {isLoading ? (
            <div className="flex items-center space-x-2 text-slate-600">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Checking connection status...</span>
            </div>
          ) : isAuthenticated ? (
            <div>
              <div className="flex items-center space-x-3 text-green-700 bg-green-50 p-4 rounded-md mb-4">
                <CheckCircle className="w-5 h-5" />
                <span>You're connected to Gmail!</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div>
              {error && (
                <div className="flex items-center space-x-3 text-red-700 bg-red-50 p-4 rounded-md mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="mb-6">
                <p className="text-slate-600 mb-4">
                  Connect your Gmail account to start using Saha. This will allow Saha to:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Read your emails</li>
                  <li>Send emails on your behalf</li>
                </ul>
              </div>
              
              <button
                onClick={login}
                className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Connect to Gmail</span>
              </button>
              
              <div className="mt-4 text-xs text-slate-500">
                <p>
                  Before connecting, make sure to:
                </p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Set up a Google Cloud project</li>
                  <li>Enable Gmail API</li>
                  <li>Create OAuth 2.0 credentials</li>
                  <li>Update the CLIENT_ID value in the application</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Setup Instructions
          </h2>
          
          <div className="prose prose-slate max-w-none">
            <ol className="space-y-4">
              <li>
                <strong>Create a Google Cloud Project:</strong>
                <ul className="mt-2">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Cloud Console</a></li>
                  <li>Create a new project</li>
                </ul>
              </li>
              
              <li>
                <strong>Enable the Gmail API:</strong>
                <ul className="mt-2">
                  <li>In your project, navigate to "APIs & Services" > "Library"</li>
                  <li>Search for "Gmail API" and enable it</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure OAuth Consent Screen:</strong>
                <ul className="mt-2">
                  <li>Go to "APIs & Services" > "OAuth consent screen"</li>
                  <li>Select "External" user type and create</li>
                  <li>Fill in the required fields (App name, support email)</li>
                  <li>Add authorized domains (your app's domain)</li>
                  <li>Add scopes for Gmail API:
                    <ul>
                      <li>https://www.googleapis.com/auth/gmail.readonly</li>
                      <li>https://www.googleapis.com/auth/gmail.send</li>
                    </ul>
                  </li>
                </ul>
              </li>
              
              <li>
                <strong>Create OAuth Credentials:</strong>
                <ul className="mt-2">
                  <li>Go to "APIs & Services" > "Credentials"</li>
                  <li>Click "Create Credentials" > "OAuth client ID"</li>
                  <li>Select "Web application" as application type</li>
                  <li>Add authorized JavaScript origins:
                    <ul>
                      <li>http://localhost:8080 (for development)</li>
                      <li>https://your-domain.com (for production)</li>
                    </ul>
                  </li>
                  <li>Add authorized redirect URIs (same as origins)</li>
                  <li>Click "Create" and copy your Client ID</li>
                </ul>
              </li>
              
              <li>
                <strong>Update Your Application:</strong>
                <ul className="mt-2">
                  <li>Open src/services/gmailService.ts</li>
                  <li>Replace the empty CLIENT_ID value with your OAuth client ID</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
