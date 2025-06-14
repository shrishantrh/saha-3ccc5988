
import React, { useState } from 'react';
import { Search, Filter, Calendar, User, Tag, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
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
    <div className="bg-white border-b border-slate-200 p-4 space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder="Search emails..."
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          {/* Sender Filter */}
          <div className="space-y-2">
            <Label htmlFor="sender" className="text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-1" />
              Sender
            </Label>
            <Input
              id="sender"
              value={filters.sender}
              onChange={(e) => updateFilter('sender', e.target.value)}
              placeholder="sender@example.com"
              className="text-sm"
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Date Range
            </Label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              Category
            </Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger className="text-sm">
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

          {/* Label Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Labels</Label>
            <Select value={filters.label} onValueChange={(value) => updateFilter('label', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All labels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All labels</SelectItem>
                {labels.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
              <SelectTrigger className="text-sm">
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

          {/* Quick Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Filters</Label>
            <div className="space-y-2">
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
        </div>
      )}
    </div>
  );
};

export default EmailSearch;
