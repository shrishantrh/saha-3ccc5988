
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SearchFilters {
  query: string;
  sender: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  category: string;
  label: string;
  priority: 'all' | 'high' | 'medium' | 'low';
  hasAttachments: boolean;
  isUnread: boolean;
}

interface EmailSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  categories: string[];
  labels: string[];
}

const EmailSearch: React.FC<EmailSearchProps> = ({ onSearch, onClear, categories, labels }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sender: '',
    dateRange: 'all',
    category: '',
    label: '',
    priority: 'all',
    hasAttachments: false,
    isUnread: false
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      sender: '',
      dateRange: 'all',
      category: '',
      label: '',
      priority: 'all',
      hasAttachments: false,
      isUnread: false
    };
    setFilters(clearedFilters);
    onClear();
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'query' || key === 'sender') return value.trim() !== '';
    if (key === 'dateRange' || key === 'priority') return value !== 'all';
    if (key === 'category' || key === 'label') return value !== '';
    return value === true;
  });

  return (
    <div className="w-full">
      {/* Compact Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder="Search emails..."
            className="pl-10 h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-9 ${hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}`}
        >
          <Filter className="w-4 h-4 mr-1" />
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sender</label>
              <Input
                value={filters.sender}
                onChange={(e) => updateFilter('sender', e.target.value)}
                placeholder="sender@example.com"
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filters.isUnread}
                onChange={(e) => updateFilter('isUnread', e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Unread only</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filters.hasAttachments}
                onChange={(e) => updateFilter('hasAttachments', e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Has attachments</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSearch;
