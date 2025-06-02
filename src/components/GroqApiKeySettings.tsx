
import React, { useState } from 'react';
import { Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useGroqIntegration } from '../hooks/useGroqIntegration';

const GroqApiKeySettings = () => {
  const { apiKey, isValidated, isValidating, validateAndSaveApiKey, clearApiKey } = useGroqIntegration();
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!inputKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    const isValid = await validateAndSaveApiKey(inputKey.trim());
    if (!isValid) {
      setError('Invalid API key. Please check and try again.');
    } else {
      setInputKey('');
    }
  };

  const handleDisconnect = () => {
    clearApiKey();
    setInputKey('');
    setError('');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
        <Key className="w-5 h-5 mr-2" />
        Groq AI Integration
      </h2>
      
      {isValidated ? (
        <div>
          <div className="flex items-center space-x-3 text-green-700 bg-green-50 p-4 rounded-md mb-4">
            <CheckCircle className="w-5 h-5" />
            <span>Groq API is connected and active!</span>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current API Key
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-slate-100 rounded-md font-mono text-sm">
                {showKey ? apiKey : `${'*'.repeat(20)}...${apiKey.slice(-4)}`}
              </div>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-2 text-slate-500 hover:text-slate-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-slate-600 mb-4">
              Connect your Groq API key to enable AI-powered features:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Intelligent email summaries</li>
              <li>Automatic task extraction</li>
              <li>Smart email categorization</li>
              <li>Priority detection</li>
              <li>AI-assisted replies</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="groq-api-key" className="block text-sm font-medium text-slate-700 mb-2">
                Groq API Key
              </label>
              <input
                id="groq-api-key"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter your Groq API key"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isValidating}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating || !inputKey.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? 'Validating...' : 'Connect to Groq'}
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-500">
            <p className="mb-2">To get your Groq API key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">console.groq.com</a></li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to the API Keys section</li>
              <li>Create a new API key</li>
              <li>Copy and paste it here</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroqApiKeySettings;
