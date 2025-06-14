
import React from 'react';
import { Mail, Search, Tag, Calendar, Edit, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmailSearch from './EmailSearch';

interface EmailViewHeaderProps {
  isAuthenticated: boolean;
  isGeminiConnected: boolean;
  currentView: 'email' | 'calendar';
  setCurrentView: (view: 'email' | 'calendar') => void;
  showSearchBar: boolean;
  setShowSearchBar: (show: boolean) => void;
  isLabelsVisible: boolean;
  setIsLabelsVisible: (visible: boolean) => void;
  handleCompose: () => void;
  setIsChatOpen: (open: boolean) => void;
  handleSearch: (filters: any) => void;
  handleClearSearch: () => void;
  categories: string[];
  labels: Array<{ name: string }>;
}

const EmailViewHeader: React.FC<EmailViewHeaderProps> = ({
  isAuthenticated,
  isGeminiConnected,
  currentView,
  setCurrentView,
  showSearchBar,
  setShowSearchBar,
  isLabelsVisible,
  setIsLabelsVisible,
  handleCompose,
  setIsChatOpen,
  handleSearch,
  handleClearSearch,
  categories,
  labels
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Saha
            </h1>
            <span className="text-sm text-gray-500 font-medium">
              AI-Powered Email Intelligence
            </span>
          </div>

          {/* View Toggle */}
          {isAuthenticated && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 ml-8">
              <button
                onClick={() => setCurrentView('email')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Inbox</span>
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === 'calendar'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Search and Labels Controls */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className={`p-2 rounded-lg transition-colors ${
                  showSearchBar 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setIsLabelsVisible(!isLabelsVisible)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLabelsVisible 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Toggle Labels"
              >
                <Tag className="w-4 h-4" />
                <span>Labels</span>
              </button>
            </>
          )}

          {/* Status Indicator */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Gmail Connected</span>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleCompose}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            <span className="font-medium">Compose</span>
          </button>

          {isGeminiConnected && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              title="AI Assistant"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}

          <Link 
            to="/settings" 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {showSearchBar && isAuthenticated && (
        <div className="mt-3 animate-fade-in">
          <EmailSearch
            onSearch={handleSearch}
            onClear={() => {
              handleClearSearch();
              setShowSearchBar(false);
            }}
            categories={categories}
            labels={labels.map(l => l.name)}
          />
        </div>
      )}
    </header>
  );
};

export default EmailViewHeader;
