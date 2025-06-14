
import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center p-8">
      <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-12 shadow-2xl">
        <Mail className="w-16 h-16 text-white" />
      </div>
      
      <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
        The Future of Email
      </h2>
      
      <p className="text-gray-600 max-w-2xl text-center mb-12 text-lg leading-relaxed">
        Experience AI-powered email intelligence that automatically categorizes, 
        extracts tasks, schedules meetings, and provides smart insights. 
        Connect your Gmail to get started.
      </p>
      
      <Link
        to="/settings"
        className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
      >
        <Mail className="w-6 h-6" />
        <span>Connect Gmail Account</span>
      </Link>
    </div>
  );
};

export default WelcomeScreen;
