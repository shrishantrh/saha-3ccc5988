
import React from 'react';
import { CheckCircle, Circle, Mail, X, AlertTriangle, Clock, Bot, Calendar, FileText, MessageSquare, Zap, Timer } from 'lucide-react';
import { Task, Email } from '../types';

interface TaskPanelProps {
  tasks: Task[];
  emails: Email[];
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskPriorityChange: (taskId: string) => void;
  onEmailSelect: (email: Email) => void;
}

const priorityColors = {
  'high': 'bg-red-100 text-red-700 border-red-300',
  'medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'low': 'bg-green-100 text-green-700 border-green-300'
};

const priorityIcons = {
  'high': AlertTriangle,
  'medium': Clock,
  'low': Circle
};

const labelConfig = {
  'auto-reply-ready': {
    label: 'Auto Reply Ready',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: Bot
  },
  'deadline-approaching': {
    label: 'Deadline Soon',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: Timer
  },
  'action-required': {
    label: 'Action Required',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Zap
  },
  'follow-up': {
    label: 'Follow Up',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: MessageSquare
  },
  'meeting-scheduled': {
    label: 'Meeting/Call',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon: Calendar
  },
  'document-needed': {
    label: 'Document Needed',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: FileText
  },
  'waiting-response': {
    label: 'Waiting Response',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock
  },
  'urgent': {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-300',
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
      <div className={`p-3 border border-slate-200 rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
        completed ? 'opacity-60' : ''
      }`}>
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onTaskComplete(task.id)}
            className={`mt-0.5 transition-colors ${
              completed ? 'text-green-600' : 'text-slate-400 hover:text-green-600'
            }`}
          >
            {completed ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium mb-2 ${
              completed ? 'line-through text-slate-500' : 'text-slate-900'
            }`}>
              {task.title}
            </h4>
            
            {!completed && (
              <div className="mb-2">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${labelInfo.color}`}>
                  <LabelIcon className="w-3 h-3" />
                  <span>{labelInfo.label}</span>
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onTaskPriorityChange(task.id)}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border cursor-pointer transition-colors hover:opacity-80 ${
                    priorityColors[task.priority]
                  }`}
                >
                  <PriorityIcon className="w-3 h-3" />
                  <span className="capitalize">{task.priority}</span>
                </button>
                
                <span className={`text-xs ${
                  task.daysLeft <= 1 ? 'text-red-600 font-medium' : 
                  task.daysLeft <= 3 ? 'text-yellow-600' : 'text-slate-500'
                }`}>
                  {task.daysLeft === 0 ? 'Due today' : 
                   task.daysLeft === 1 ? '1 day left' : 
                   `${task.daysLeft} days left`}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active Tasks - Grouped by Label */}
        {Object.entries(groupedTasks).map(([label, labelTasks]) => {
          const labelInfo = labelConfig[label as keyof typeof labelConfig];
          const LabelIcon = labelInfo.icon;
          
          return (
            <div key={label}>
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border mr-2 ${labelInfo.color}`}>
                  <LabelIcon className="w-3 h-3" />
                  <span>{labelInfo.label}</span>
                </span>
                <span className="text-slate-500">({labelTasks.length})</span>
              </h3>
              <div className="space-y-3 ml-4">
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
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-3">
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
