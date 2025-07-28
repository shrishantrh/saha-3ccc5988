
import React from 'react';
import { Mail, Search, Tag, Edit, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmailSearch from './EmailSearch';
import ThemeToggle from './ThemeToggle';

interface EmailViewHeaderProps {
  isAuthenticated: boolean;
  isGeminiConnected: boolean;
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
    <header className="bg-background border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Saha
            </h1>
            <span className="text-sm text-muted-foreground font-medium">
              AI-Powered Email Intelligence
            </span>
          </div>

        </div>

        <div className="flex items-center space-x-3">
          {/* Search and Labels Controls */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className={`p-2 rounded-lg transition-colors ${
                  showSearchBar 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setIsLabelsVisible(!isLabelsVisible)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLabelsVisible 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
            <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Gmail Connected</span>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleCompose}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            <span className="font-medium">Compose</span>
          </button>

          {isGeminiConnected && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
              title="AI Assistant"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}

          <ThemeToggle />

          <Link
            to="/settings" 
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
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
