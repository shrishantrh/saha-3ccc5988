
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
    <div className="bg-white h-full flex flex-col">
      {/* Modern Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Smart Labels</h3>
              <p className="text-xs text-gray-500">AI-generated & custom</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="p-2 hover:bg-blue-100 text-blue-600"
            title="Add Label"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Labels List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* All Emails */}
        <button
          onClick={() => onFilterByLabel('')}
          className={`w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-100 transition-colors text-sm group ${
            !selectedLabel ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <span className="font-medium">All Emails</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {labels.reduce((sum, label) => sum + label.count, 0)}
          </span>
        </button>

        {/* AI-Generated Labels Section */}
        <div className="pt-2">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Generated</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          {/* Custom Labels */}
          {labels.map((label) => (
            <div key={label.id} className="group">
              {editingId === label.id ? (
                <div className="p-3 space-y-3 border border-gray-300 rounded-lg bg-gray-50">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <Palette className="w-3 h-3 text-gray-500" />
                    <div className="flex space-x-1">
                      {LABEL_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewLabelColor(color)}
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            newLabelColor === color ? 'border-gray-400 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveEdit} className="h-7 text-xs">
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onFilterByLabel(label.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-100 transition-all duration-200 group text-sm ${
                    selectedLabel === label.name ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate font-medium">{label.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{label.count}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLabel(label);
                        }}
                        className="p-1 hover:bg-blue-100 hover:text-blue-600 rounded"
                        title="Edit label"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLabel(label.id);
                        }}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded"
                        title="Delete label"
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
          <div className="mt-3 p-3 space-y-3 border border-gray-300 rounded-lg bg-gray-50">
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="New label name"
              className="h-8 text-sm"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <Palette className="w-3 h-3 text-gray-500" />
              <div className="flex space-x-1">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      newLabelColor === color ? 'border-gray-400 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleCreateLabel} className="h-7 text-xs">
                Create
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs">
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
