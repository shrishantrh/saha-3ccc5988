
import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Task, Email } from '../types';
import TaskItem from './TaskItem';

interface TaskPanelProps {
  tasks: Task[];
  emails: Email[];
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskPriorityChange: (taskId: string) => void;
  onEmailSelect: (email: Email) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const labelConfig = {
  'auto-reply-ready': {
    label: 'Auto Reply Ready',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: '🤖'
  },
  'deadline-approaching': {
    label: 'Deadline Soon',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: '⏰'
  },
  'action-required': {
    label: 'Action Required',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: '⚡'
  },
  'follow-up': {
    label: 'Follow Up',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: '💬'
  },
  'meeting-scheduled': {
    label: 'Meeting/Call',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon: '📅'
  },
  'document-needed': {
    label: 'Document Needed',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: '📄'
  },
  'waiting-response': {
    label: 'Waiting Response',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: '⏳'
  },
  'urgent': {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: '🚨'
  }
};

const TaskPanel: React.FC<TaskPanelProps> = ({ 
  tasks, 
  emails, 
  onTaskComplete, 
  onTaskDelete, 
  onTaskPriorityChange, 
  onEmailSelect,
  onTaskUpdate = () => {}
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const getSourceEmail = (emailId: string) => {
    return emails.find(email => email.id === emailId);
  };

  const toggleSection = (sectionKey: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey);
    } else {
      newCollapsed.add(sectionKey);
    }
    setCollapsedSections(newCollapsed);
  };

  // Group active tasks by label
  const groupedTasks = activeTasks.reduce((acc, task) => {
    if (!acc[task.label]) {
      acc[task.label] = [];
    }
    acc[task.label].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white/60 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Tasks</h2>
        <p className="text-sm text-slate-600">
          {activeTasks.length} active • {completedTasks.length} completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Active Tasks - Grouped by Label */}
        {Object.entries(groupedTasks).map(([label, labelTasks]) => {
          const labelInfo = labelConfig[label as keyof typeof labelConfig];
          const isCollapsed = collapsedSections.has(label);
          
          return (
            <div key={label} className="bg-white/80 border border-slate-200 rounded-lg">
              <button
                onClick={() => toggleSection(label)}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{labelInfo.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{labelInfo.label}</span>
                  <span className="text-xs text-slate-500">({labelTasks.length})</span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              
              {!isCollapsed && (
                <div className="px-3 pb-3 space-y-1">
                  {labelTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      sourceEmail={getSourceEmail(task.emailId)}
                      onTaskComplete={onTaskComplete}
                      onTaskDelete={onTaskDelete}
                      onTaskUpdate={onTaskUpdate}
                      onEmailSelect={onEmailSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="bg-white/80 border border-slate-200 rounded-lg">
            <button
              onClick={() => toggleSection('completed')}
              className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Completed</span>
                <span className="text-xs text-slate-500">({completedTasks.length})</span>
              </div>
              {collapsedSections.has('completed') ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {!collapsedSections.has('completed') && (
              <div className="px-3 pb-3 space-y-1">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    sourceEmail={getSourceEmail(task.emailId)}
                    onTaskComplete={onTaskComplete}
                    onTaskDelete={onTaskDelete}
                    onTaskUpdate={onTaskUpdate}
                    onEmailSelect={onEmailSelect}
                    completed
                  />
                ))}
              </div>
            )}
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
