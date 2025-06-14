
import React, { useState } from 'react';
import { Tag, Plus, X, Edit2, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface EmailLabel {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface EmailLabelsProps {
  labels: EmailLabel[];
  onCreateLabel: (name: string, color: string) => void;
  onDeleteLabel: (labelId: string) => void;
  onEditLabel: (labelId: string, name: string, color: string) => void;
  onFilterByLabel: (labelName: string) => void;
  selectedLabel?: string;
}

const LABEL_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const EmailLabels: React.FC<EmailLabelsProps> = ({
  labels,
  onCreateLabel,
  onDeleteLabel,
  onEditLabel,
  onFilterByLabel,
  selectedLabel
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onCreateLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0]);
      setIsCreating(false);
    }
  };

  const handleEditLabel = (label: EmailLabel) => {
    setEditingId(label.id);
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
  };

  const handleSaveEdit = () => {
    if (editingId && newLabelName.trim()) {
      onEditLabel(editingId, newLabelName.trim(), newLabelColor);
      setEditingId(null);
      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0]);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setNewLabelName('');
    setNewLabelColor(LABEL_COLORS[0]);
  };

  return (
    <div className="bg-white border-r border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center text-sm">
            <Tag className="w-4 h-4 mr-2" />
            Labels
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="p-1 h-auto"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Labels List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* All Emails */}
        <button
          onClick={() => onFilterByLabel('')}
          className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-slate-100 transition-colors text-sm ${
            !selectedLabel ? 'bg-blue-100 text-blue-700' : ''
          }`}
        >
          <span className="font-medium">All Emails</span>
          <span className="text-xs text-slate-500">
            {labels.reduce((sum, label) => sum + label.count, 0)}
          </span>
        </button>

        {/* Custom Labels */}
        <div className="mt-2 space-y-1">
          {labels.map((label) => (
            <div key={label.id} className="group">
              {editingId === label.id ? (
                <div className="p-2 space-y-2 border border-slate-200 rounded-md bg-slate-50">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <div className="flex space-x-1">
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewLabelColor(color)}
                        className={`w-3 h-3 rounded-full border ${
                          newLabelColor === color ? 'border-slate-400' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" onClick={handleSaveEdit} className="h-6 text-xs">
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-6 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onFilterByLabel(label.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-slate-100 transition-colors group text-sm ${
                    selectedLabel === label.name ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate">{label.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-slate-500">{label.count}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLabel(label);
                        }}
                        className="p-0.5 hover:bg-slate-200 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLabel(label.id);
                        }}
                        className="p-0.5 hover:bg-red-100 hover:text-red-600 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Create New Label */}
        {isCreating && (
          <div className="mt-2 p-2 space-y-2 border border-slate-200 rounded-md bg-slate-50">
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="New label name"
              className="h-7 text-sm"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <Palette className="w-3 h-3 text-slate-500" />
              <div className="flex space-x-1">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`w-3 h-3 rounded-full border ${
                      newLabelColor === color ? 'border-slate-400' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-1">
              <Button size="sm" onClick={handleCreateLabel} className="h-6 text-xs">
                Create
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-6 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailLabels;
