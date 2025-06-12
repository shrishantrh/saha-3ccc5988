
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
  children?: React.ReactNode;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({ date, onDateChange, className, children }) => {
  // Ensure we're working with a proper Date object and handle timezone issues
  const normalizeDate = (inputDate: Date | string): Date => {
    if (typeof inputDate === 'string') {
      // Create date at noon to avoid timezone issues
      const [year, month, day] = inputDate.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0);
    }
    return new Date(inputDate);
  };

  const normalizedDate = normalizeDate(date);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Ensure the selected date is normalized to avoid timezone issues
      const normalizedSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      onDateChange(normalizedSelected);
    } else {
      onDateChange(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ? (
          <div className="cursor-pointer">{children}</div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs font-normal justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-100",
              className
            )}
          >
            <CalendarIcon className="w-3 h-3 mr-1" />
            {format(normalizedDate, 'MMM dd')}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={normalizedDate}
          onSelect={handleDateSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerInput;
