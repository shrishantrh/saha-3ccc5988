
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerInputProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({ date, onDateChange, className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs font-normal justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-100",
            className
          )}
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          {format(date, 'MMM dd')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerInput;
