
import React from 'react';
import TaskPanel from './TaskPanel';
import { Email, Task } from '../types';

interface TaskPanelSectionProps {
  tasks: Task[];
  emails: Email[];
  handleTaskComplete: (taskId: string) => void;
  handleTaskDelete: (taskId: string) => void;
  handleTaskPriorityChange: (taskId: string) => void;
  handleTaskDateChange: (taskId: string, newDate: Date) => void;
  handleEmailSelect: (email: Email) => void;
}

const TaskPanelSection: React.FC<TaskPanelSectionProps> = ({
  tasks,
  emails,
  handleTaskComplete,
  handleTaskDelete,
  handleTaskPriorityChange,
  handleTaskDateChange,
  handleEmailSelect
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200">
      <TaskPanel 
        tasks={tasks}
        emails={emails}
        onTaskComplete={handleTaskComplete}
        onTaskDelete={handleTaskDelete}
        onTaskPriorityChange={handleTaskPriorityChange}
        onEmailSelect={handleEmailSelect}
        onTaskDateChange={handleTaskDateChange}
      />
    </div>
  );
};

export default TaskPanelSection;
