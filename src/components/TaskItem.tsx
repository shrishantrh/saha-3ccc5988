
import React, { useState } from 'react';
import { CheckCircle, Circle, Mail, X, Calendar, Edit2 } from 'lucide-react';
import { Task, Email } from '../types';
import { Calendar as CalendarUI } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  sourceEmail?: Email;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onEmailSelect: (email: Email) => void;
  completed?: boolean;
}

const priorityColors = {
  'high': 'text-red-600',
  'medium': 'text-yellow-600',
  'low': 'text-green-600'
};

const labelOptions = [
  'auto-reply-ready', 'deadline-approaching', 'action-required', 'follow-up',
  'meeting-scheduled', 'document-needed', 'waiting-response', 'urgent'
];

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  sourceEmail, 
  onTaskComplete, 
  onTaskDelete, 
  onTaskUpdate,
  onEmailSelect,
  completed = false 
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      onTaskUpdate(task.id, {
        dueDate: date.toISOString().split('T')[0],
        daysLeft: Math.max(0, daysLeft)
      });
    }
    setIsEditingDate(false);
  };

  const handleLabelChange = (newLabel: string) => {
    onTaskUpdate(task.id, { label: newLabel as Task['label'] });
    setIsEditingLabel(false);
  };

  return (
    <div className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors ${
      completed ? 'opacity-60' : ''
    }`}>
      <button
        onClick={() => onTaskComplete(task.id)}
        className={`transition-colors ${
          completed ? 'text-green-600' : 'text-slate-400 hover:text-green-600'
        }`}
      >
        {completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium truncate ${
            completed ? 'line-through text-slate-500' : 'text-slate-900'
          }`}>
            {task.title}
          </h4>
          
          <div className="flex items-center space-x-1 ml-2">
            {/* Due Date Editor */}
            <Popover open={isEditingDate} onOpenChange={setIsEditingDate}>
              <PopoverTrigger asChild>
                <button className="text-xs text-slate-500 hover:text-blue-600 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span className={task.daysLeft <= 1 ? 'text-red-600 font-medium' : 
                                 task.daysLeft <= 3 ? 'text-yellow-600' : ''}>
                    {task.daysLeft === 0 ? 'Today' : 
                     task.daysLeft === 1 ? '1d' : 
                     `${task.daysLeft}d`}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarUI
                  mode="single"
                  selected={new Date(task.dueDate)}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Label Editor */}
            <Select open={isEditingLabel} onOpenChange={setIsEditingLabel} value={task.label} onValueChange={handleLabelChange}>
              <SelectTrigger asChild>
                <button className="text-xs px-1 py-0.5 rounded border border-transparent hover:border-slate-300">
                  <Edit2 className="w-3 h-3" />
                </button>
              </SelectTrigger>
              <SelectContent>
                {labelOptions.map(label => (
                  <SelectItem key={label} value={label}>
                    {label.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority */}
            <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority[0].toUpperCase()}
            </span>

            {/* Actions */}
            {sourceEmail && (
              <button
                onClick={() => onEmailSelect(sourceEmail)}
                className="p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                title="View email"
              >
                <Mail className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => onTaskDelete(task.id)}
              className="p-0.5 text-slate-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
