
import React from 'react';
import { useGmailAuth } from '../hooks/useGmailAuth';
import { useGeminiIntegration } from '../hooks/useGeminiIntegration';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, LogOut, Key, Sparkles } from 'lucide-react';
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
                  <li>In your project, navigate to &quot;APIs &amp; Services&quot; &gt; &quot;Library&quot;</li>
                  <li>Search for &quot;Gmail API&quot; and enable it</li>
                </ul>
              </li>
              
              <li>
                <strong>Configure OAuth Consent Screen:</strong>
                <ul className="mt-2">
                  <li>Go to &quot;APIs &amp; Services&quot; &gt; &quot;OAuth consent screen&quot;</li>
                  <li>Select &quot;External&quot; user type and create</li>
                  <li>Fill in the required fields (App name, support email)</li>
                  <li>Add authorized domains (your app&apos;s domain)</li>
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
                  <li>Go to &quot;APIs &amp; Services&quot; &gt; &quot;Credentials&quot;</li>
                  <li>Click &quot;Create Credentials&quot; &gt; &quot;OAuth client ID&quot;</li>
                  <li>Select &quot;Web application&quot; as application type</li>
                  <li>Add authorized JavaScript origins:
                    <ul>
                      <li>http://localhost:8080 (for development)</li>
                      <li>https://your-domain.com (for production)</li>
                    </ul>
                  </li>
                  <li>Add authorized redirect URIs (same as origins)</li>
                  <li>Click &quot;Create&quot; and copy your Client ID</li>
                </ul>
              </li>
              
              <li>
                <strong>Update Your Application:</strong>
                <ul className="mt-2">
                  <li>Open src/services/gmailService.ts</li>
                  <li>Replace the CLIENT_ID value with your OAuth client ID</li>
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
