
import React from 'react';
import { useGmailAuth } from '../hooks/useGmailAuth';
import { useGeminiIntegration } from '../hooks/useGeminiIntegration';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, LogOut, Key, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { isAuthenticated, isLoading, error, login, logout } = useGmailAuth();
  const { 
    apiKey, 
    isValidated: isGeminiConnected, 
    isValidating, 
    validateAndSaveApiKey, 
    clearApiKey 
  } = useGeminiIntegration();

  const [geminiApiKey, setGeminiApiKey] = React.useState('');
  const [geminiError, setGeminiError] = React.useState<string | null>(null);

  const handleGeminiApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiApiKey.trim()) return;

    setGeminiError(null);
    const isValid = await validateAndSaveApiKey(geminiApiKey.trim());
    
    if (isValid) {
      setGeminiApiKey('');
    } else {
      setGeminiError('Invalid API key. Please check your Gemini API key and try again.');
    }
  };

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
      <div className="max-w-3xl space-y-6">
        {/* Gmail Connection */}
        <div className="bg-white shadow-md rounded-lg p-6">
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
                <div className="flex items-start space-x-3 text-red-700 bg-red-50 p-4 rounded-md mb-4">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{error}</p>
                    {error.includes('Client ID') && (
                      <p className="text-sm mt-2">
                        Make sure you've followed the setup instructions below and replaced the CLIENT_ID in the code.
                      </p>
                    )}
                  </div>
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
            </div>
          )}
        </div>

        {/* Gemini AI Integration */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-800">
              Gemini AI Integration
            </h2>
          </div>

          {isGeminiConnected ? (
            <div>
              <div className="flex items-center space-x-3 text-purple-700 bg-purple-50 p-4 rounded-md mb-4">
                <CheckCircle className="w-5 h-5" />
                <span>Gemini AI is connected and active!</span>
              </div>
              
              <div className="mb-4">
                <p className="text-slate-600 mb-2">
                  Your emails are being enhanced with AI analysis including:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4 text-sm">
                  <li>Smart categorization and priority detection</li>
                  <li>Automatic task extraction</li>
                  <li>Sentiment analysis</li>
                  <li>AI-powered email search and chat</li>
                </ul>
              </div>

              <button
                onClick={clearApiKey}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Gemini</span>
              </button>
            </div>
          ) : (
            <div>
              {geminiError && (
                <div className="flex items-center space-x-3 text-red-700 bg-red-50 p-4 rounded-md mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{geminiError}</span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-slate-600 mb-4">
                  Connect Gemini AI to unlock powerful email intelligence features:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Smart email categorization and priority detection</li>
                  <li>Automatic task and deadline extraction</li>
                  <li>AI-powered email search and chat assistant</li>
                  <li>Sentiment analysis and response suggestions</li>
                </ul>
              </div>

              <form onSubmit={handleGeminiApiKeySubmit} className="space-y-4">
                <div>
                  <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-700 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    id="gemini-api-key"
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!geminiApiKey.trim() || isValidating}
                  className="flex items-center space-x-3 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      <span>Connect Gemini AI</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
        
        {/* Setup Instructions */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Gmail Setup Instructions
          </h2>
          
          <div className="prose prose-slate max-w-none">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800">Important: OAuth 2.0 Setup Required</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    You must complete the setup below and set your CLIENT_ID before Gmail connection will work. Make sure to use the correct redirect URIs for the new OAuth flow.
                  </p>
                </div>
              </div>
            </div>

            <ol className="space-y-4">
              <li>
                <strong>Create a Google Cloud Project:</strong>
                <ul className="mt-2">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center">Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                  <li>Create a new project</li>
                </ul>
              </li>
              
              <li>
                <strong>Enable the Gmail API:</strong>
                <ul className="mt-2">
                  <li>In your project, navigate to "APIs & Services" {'>'}  "Library"</li>
                  <li>Search for "Gmail API" and enable it</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure OAuth Consent Screen:</strong>
                <ul className="mt-2">
                  <li>Go to "APIs & Services" {'>'} "OAuth consent screen"</li>
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
                  <li>Go to "APIs & Services" {'>'} "Credentials"</li>
                  <li>Click "Create Credentials" {'>'} "OAuth client ID"</li>
                  <li>Select "Web application" as application type</li>
                  <li><strong className="text-green-600">Important:</strong> Add authorized JavaScript origins (NOT redirect URIs for this flow):
                    <ul>
                      <li>http://localhost:8080 (for development)</li>
                      <li>http://192.168.12.203:8080 (your current development server)</li>
                      <li>https://your-domain.com (for production)</li>
                    </ul>
                  </li>
                  <li className="text-slate-600 text-sm">Note: The new Google Identity Services uses JavaScript origins instead of redirect URIs for the token flow</li>
                  <li>Click "Create" and copy your Client ID</li>
                </ul>
              </li>
              
              <li>
                <strong className="text-red-600">Update Your Application (REQUIRED):</strong>
                <ul className="mt-2">
                  <li>Set the <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">VITE_GMAIL_CLIENT_ID</code> environment variable with your OAuth client ID</li>
                  <li>Or replace <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">YOUR_GMAIL_CLIENT_ID</code> in <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">src/services/gmailService.ts</code></li>
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
