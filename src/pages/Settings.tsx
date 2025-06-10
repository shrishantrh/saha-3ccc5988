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
            <span>👈 Back to Dashboard</span>
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
                    {error.includes('redirect_uri_mismatch') && (
                      <p className="text-sm mt-2">
                        Make sure you've added the correct <strong>JavaScript origins</strong> (not redirect URIs) to your OAuth client configuration. See setup instructions below.
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
                    You must complete the setup below with the correct <strong>JavaScript origins</strong> configuration. The new Google Identity Services uses origins, not redirect URIs.
                  </p>
                </div>
              </div>
            </div>

            <ol className="space-y-4">
              <li>
                <strong>Create a Google Cloud Project:</strong>
                <ul className="mt-2">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center">Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                  <li>Create a new project or select an existing one</li>
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
                  <li>Fill in the required fields (App name, support email, developer contact)</li>
                  <li>Add scopes for Gmail API:
                    <ul className="ml-4 mt-1">
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">https://www.googleapis.com/auth/gmail.readonly</code></li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">https://www.googleapis.com/auth/gmail.send</code></li>
                    </ul>
                  </li>
                  <li>Add test users if your app is not yet published</li>
                </ul>
              </li>
              
              <li>
                <strong className="text-green-600">Create OAuth Credentials (Critical Step):</strong>
                <ul className="mt-2">
                  <li>Go to "APIs & Services" {'>'} "Credentials"</li>
                  <li>Click "Create Credentials" {'>'} "OAuth client ID"</li>
                  <li>Select "Web application" as application type</li>
                  <li><strong className="text-red-600">IMPORTANT:</strong> Add <strong>Authorized JavaScript origins</strong> (NOT redirect URIs):
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                      <p className="font-medium text-blue-800 mb-2">Add these JavaScript origins:</p>
                      <ul className="space-y-1 text-sm">
                        <li><code className="bg-white px-2 py-1 rounded border">http://localhost:8080</code> (for development)</li>
                        <li><code className="bg-white px-2 py-1 rounded border">http://192.168.12.203:8080</code> (your current development server)</li>
                        <li><code className="bg-white px-2 py-1 rounded border">https://your-domain.com</code> (for production)</li>
                      </ul>
                      <p className="text-blue-700 text-xs mt-2">
                        ⚠️ Do NOT add any "Authorized redirect URIs" - leave that section empty for Google Identity Services
                      </p>
                    </div>
                  </li>
                  <li>Click "Create" and copy your Client ID</li>
                </ul>
              </li>
              
              <li>
                <strong>Verify Your Configuration:</strong>
                <ul className="mt-2">
                  <li>Your OAuth client should have <strong>JavaScript origins</strong> configured</li>
                  <li>Your OAuth client should have <strong>NO redirect URIs</strong> configured</li>
                  <li>Your consent screen should include the Gmail scopes</li>
                  <li>The client ID in the code matches your OAuth client ID</li>
                </ul>
              </li>
            </ol>

            <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800">Current Configuration</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Client ID: <code className="bg-white px-1 py-0.5 rounded text-xs">881935451747-qhc9n0jtlpe206rb2ri50kaajsl196hp.apps.googleusercontent.com</code>
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Make sure this matches your OAuth client ID and that you've added the JavaScript origins above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
