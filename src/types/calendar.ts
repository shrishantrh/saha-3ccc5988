
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  source: 'google' | 'saha';
  priority?: 'low' | 'medium' | 'high';
  taskId?: string; // Link to related task
  recurring?: boolean;
  reminderMinutes?: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
}

export interface TaskSuggestion {
  task: string;
  estimatedDuration: number; // in minutes
  priority: 'low' | 'medium' | 'high';
  taskIds: string[];
  reason: string;
}

export interface CalendarInsight {
  freeSlots: TimeSlot[];
  suggestedTasks: TaskSuggestion[];
  busyPeriods: TimeSlot[];
}
