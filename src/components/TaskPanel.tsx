
import React from 'react';
import { CheckCircle, Circle, Mail, X, AlertTriangle, Clock, Bot, Calendar, FileText, MessageSquare, Zap, Timer } from 'lucide-react';
import { Task, Email } from '../types';
import DatePickerInput from './DatePickerInput';

interface TaskPanelProps {
  tasks: Task[];
  emails: Email[];
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskPriorityChange: (taskId: string) => void;
  onEmailSelect: (email: Email) => void;
}

const priorityColors = {
  'high': 'text-red-600',
  'medium': 'text-yellow-600',
  'low': 'text-green-600'
};

const priorityIcons = {
  'high': AlertTriangle,
  'medium': Clock,
  'low': Circle
};

const labelConfig = {
  'auto-reply-ready': {
    label: 'Auto Reply',
    color: 'text-emerald-600',
    icon: Bot
  },
  'deadline-approaching': {
    label: 'Deadline',
    color: 'text-orange-600',
    icon: Timer
  },
  'action-required': {
    label: 'Action',
    color: 'text-blue-600',
    icon: Zap
  },
  'follow-up': {
    label: 'Follow Up',
    color: 'text-purple-600',
    icon: MessageSquare
  },
  'meeting-scheduled': {
    label: 'Meeting',
    color: 'text-indigo-600',
    icon: Calendar
  },
  'document-needed': {
    label: 'Document',
    color: 'text-amber-600',
    icon: FileText
  },
  'waiting-response': {
    label: 'Waiting',
    color: 'text-slate-600',
    icon: Clock
  },
  'urgent': {
    label: 'Urgent',
    color: 'text-red-600',
    icon: AlertTriangle
  }
};

const TaskPanel: React.FC<TaskPanelProps> = ({ 
  tasks, 
  emails, 
  onTaskComplete, 
  onTaskDelete, 
  onTaskPriorityChange, 
  onEmailSelect 
}) => {
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const getSourceEmail = (emailId: string) => {
    return emails.find(email => email.id === emailId);
  };

  const handleDateChange = (taskId: string, newDate: Date | undefined) => {
    if (newDate) {
      // For now, we'll just log this - you'll need to implement the actual date change logic
      console.log(`Changing task ${taskId} due date to ${newDate.toISOString()}`);
    }
  };

  // Group active tasks by label
  const groupedTasks = activeTasks.reduce((acc, task) => {
    if (!acc[task.label]) {
      acc[task.label] = [];
    }
    acc[task.label].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const TaskItem: React.FC<{ task: Task; completed?: boolean }> = ({ task, completed = false }) => {
    const sourceEmail = getSourceEmail(task.emailId);
    const PriorityIcon = priorityIcons[task.priority];
    const labelInfo = labelConfig[task.label];
    const LabelIcon = labelInfo.icon;

    return (
      <div className={`p-2 border border-slate-200 rounded-md bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-sm ${
        completed ? 'opacity-60' : ''
      }`}>
        <div className="flex items-start space-x-2">
          <button
            onClick={() => onTaskComplete(task.id)}
            className={`mt-0.5 transition-colors ${
              completed ? 'text-green-600' : 'text-slate-400 hover:text-green-600'
            }`}
          >
            {completed ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium mb-1 leading-tight ${
              completed ? 'line-through text-slate-500' : 'text-slate-900'
            }`}>
              {task.title}
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!completed && (
                  <span className={`inline-flex items-center space-x-1 text-xs font-medium ${labelInfo.color}`}>
                    <LabelIcon className="w-3 h-3" />
                    <span>{labelInfo.label}</span>
                  </span>
                )}
                
                <button
                  onClick={() => onTaskPriorityChange(task.id)}
                  className={`inline-flex items-center space-x-1 text-xs font-medium cursor-pointer transition-colors hover:opacity-80 ${
                    priorityColors[task.priority]
                  }`}
                >
                  <PriorityIcon className="w-3 h-3" />
                  <span className="capitalize">{task.priority}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                {!completed && (
                  <DatePickerInput
                    date={new Date(task.dueDate)}
                    onDateChange={(date) => handleDateChange(task.id, date)}
                  />
                )}
                
                {sourceEmail && (
                  <button
                    onClick={() => onEmailSelect(sourceEmail)}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title="View source email"
                  >
                    <Mail className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete task"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {!completed && (
              <div className="mt-1">
                <span className={`text-xs ${
                  task.daysLeft <= 1 ? 'text-red-600 font-medium' : 
                  task.daysLeft <= 3 ? 'text-yellow-600' : 'text-slate-500'
                }`}>
                  {task.daysLeft === 0 ? 'Due today' : 
                   task.daysLeft === 1 ? '1 day left' : 
                   `${task.daysLeft} days left`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white/60 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Tasks</h2>
        <p className="text-sm text-slate-600">
          {activeTasks.length} active • {completedTasks.length} completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Active Tasks - Grouped by Label */}
        {Object.entries(groupedTasks).map(([label, labelTasks]) => {
          const labelInfo = labelConfig[label as keyof typeof labelConfig];
          const LabelIcon = labelInfo.icon;
          
          return (
            <div key={label}>
              <h3 className="text-xs font-medium text-slate-600 mb-2 flex items-center uppercase tracking-wide">
                <LabelIcon className="w-3 h-3 mr-1" />
                {labelInfo.label} ({labelTasks.length})
              </h3>
              <div className="space-y-2">
                {labelTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-600 mb-2 flex items-center uppercase tracking-wide">
              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} completed />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
            <p className="text-sm">Tasks will be extracted from your emails automatically</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPanel;
