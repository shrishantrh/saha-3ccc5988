
import React from 'react';
import { Check, Trash2, Mail, MailOpen, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EmailBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onAddLabel: (label: string) => void;
  onStar: () => void;
  availableLabels: string[];
  isAllSelected: boolean;
}

const EmailBulkActions: React.FC<EmailBulkActionsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onAddLabel,
  availableLabels,
  isAllSelected
}) => {
  // Prevent crashes with safety checks
  const safeSelectedCount = selectedCount || 0;
  const safeTotalCount = totalCount || 0;
  const safeAvailableLabels = availableLabels || [];

  if (safeSelectedCount === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              try {
                onSelectAll();
              } catch (error) {
                console.error('Error selecting all:', error);
              }
            }}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Select all"
          >
            <div className="w-4 h-4 border-2 border-slate-400 rounded"></div>
          </button>
          <span className="text-sm text-slate-600">{safeTotalCount} emails</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-slate-200">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            try {
              isAllSelected ? onDeselectAll() : onSelectAll();
            } catch (error) {
              console.error('Error toggling selection:', error);
            }
          }}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
          title={isAllSelected ? "Deselect all" : "Select all"}
        >
          <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </button>
        <span className="text-sm font-medium text-blue-800">
          {safeSelectedCount} email{safeSelectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onMarkAsRead} title="Mark as read">
          <MailOpen className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onMarkAsUnread} title="Mark as unread">
          <Mail className="w-4 h-4" />
        </Button>

        <Select onValueChange={(value) => value && onAddLabel(value)}>
          <SelectTrigger className="w-auto border-none shadow-none p-2 h-auto">
            <Tag className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Add label...</SelectItem>
            {safeAvailableLabels.map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-slate-300 mx-2" />

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete} 
          title="Delete"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EmailBulkActions;
