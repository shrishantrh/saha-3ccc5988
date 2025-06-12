
import { GeminiApi } from './geminiApi';
import { GeminiMessage } from '../types/gemini';
import { CalendarInsight, TaskSuggestion } from '../types/calendar';
import { Task } from '../types';

export class GeminiCalendarService {
  private api: GeminiApi;

  constructor(apiKey: string) {
    this.api = new GeminiApi(apiKey);
  }

  async generateCalendarSuggestions(
    freeTimeMessage: string,
    tasks: Task[],
    insights: CalendarInsight
  ): Promise<string> {
    const incompleteTasks = tasks.filter(task => !task.completed);
    const highPriorityTasks = incompleteTasks.filter(task => task.priority === 'high');
    const mediumPriorityTasks = incompleteTasks.filter(task => task.priority === 'medium');
    
    const prompt = `You are an AI project manager helping the user optimize their time and productivity.

User's free time question: "${freeTimeMessage}"

Available free time slots today/tomorrow:
${insights.freeSlots.map(slot => 
  `- ${slot.start.toLocaleTimeString()} to ${slot.end.toLocaleTimeString()} (${Math.floor(slot.duration / 60)}h ${slot.duration % 60}m)`
).join('\n')}

High Priority Tasks (${highPriorityTasks.length}):
${highPriorityTasks.map(task => `- ${task.title} (Due: ${task.dueDate}, ${task.daysLeft} days left)`).join('\n')}

Medium Priority Tasks (${mediumPriorityTasks.length}):
${mediumPriorityTasks.map(task => `- ${task.title} (Due: ${task.dueDate}, ${task.daysLeft} days left)`).join('\n')}

Suggested task combinations for free slots:
${insights.suggestedTasks.map((suggestion, index) => 
  `${index + 1}. ${suggestion.task} (${suggestion.estimatedDuration}min) - ${suggestion.reason}`
).join('\n')}

Please provide a helpful, encouraging response that:
1. Acknowledges their available free time
2. Suggests 2-3 specific actionable items they could accomplish
3. Explains why these tasks are good fits for their available time
4. Offers to break down larger tasks if needed
5. Includes a friendly, motivating tone

If you suggest creating calendar events, mention that I can help schedule them directly.`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      const response = await this.api.makeRequest(messages);
      return response;
    } catch (error) {
      console.error('Error generating calendar suggestions:', error);
      return "I'd love to help you make the most of your free time! Unfortunately, I'm having trouble analyzing your schedule right now. Try asking me again in a moment.";
    }
  }

  async breakDownTask(
    taskTitle: string,
    timeframe: 'days' | 'weeks' | 'hours',
    availableTimeSlots: { start: Date; end: Date; duration: number }[]
  ): Promise<{ subtasks: Array<{ title: string; duration: number; priority: string }>, schedule: Array<{ subtask: string; timeSlot: string }> }> {
    const prompt = `Break down this task into smaller, manageable subtasks:

Task: "${taskTitle}"
Timeframe preference: ${timeframe}
Available time slots: ${availableTimeSlots.map(slot => 
  `${slot.start.toLocaleDateString()} ${slot.start.toLocaleTimeString()} - ${slot.end.toLocaleTimeString()} (${Math.floor(slot.duration / 60)}h ${slot.duration % 60}m)`
).join('\n')}

Please provide a JSON response with this structure:
{
  "subtasks": [
    {
      "title": "Specific actionable subtask",
      "duration": 60,
      "priority": "high/medium/low"
    }
  ],
  "schedule": [
    {
      "subtask": "Subtask title",
      "timeSlot": "2024-01-15 2:00 PM - 3:00 PM"
    }
  ]
}

Guidelines:
- Break the task into 3-7 subtasks
- Each subtask should be completable in one focused session
- Match subtask duration to available time slots
- Prioritize subtasks logically
- Be specific and actionable`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      const response = await this.api.makeRequest(messages);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        subtasks: [
          { title: "Research and planning phase", duration: 60, priority: "high" },
          { title: "Execute main components", duration: 120, priority: "high" },
          { title: "Review and finalize", duration: 30, priority: "medium" }
        ],
        schedule: []
      };
    } catch (error) {
      console.error('Error breaking down task:', error);
      return {
        subtasks: [
          { title: "Break down the task manually", duration: 30, priority: "high" },
          { title: "Create action plan", duration: 60, priority: "high" }
        ],
        schedule: []
      };
    }
  }
}
