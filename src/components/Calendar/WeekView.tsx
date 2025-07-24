import { CalendarEvent, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { EventCard } from './EventCard'; // Usando o novo componente simples

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function WeekView({ 
  currentDate, 
  events, 
  selectedCategories, 
  onEventClick, 
  onDateClick 
}: WeekViewProps) {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    }).sort((a, b) => a.title.localeCompare(b.title));
  };

  const getSpecialEventType = (date: Date): 'feriado' | 'recesso' | null => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.some(e => e.eventType === 'feriado')) return 'feriado';
    if (dayEvents.some(e => e.eventType === 'recesso')) return 'recesso';
    return null;
  };

  const getDayCardStyles = (date: Date) => {
    const baseStyles = "group relative min-h-[400px] p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border flex flex-col";
    const specialEventType = getSpecialEventType(date);
    
    if (onDateClick) {
      baseStyles.concat(" cursor-pointer");
    }

    if (isToday(date)) {
      return cn(baseStyles, "bg-blue-50 border-blue-200 shadow-blue-100");
    }
    
    if (specialEventType === 'feriado') {
      return cn(baseStyles, "bg-red-50 border-red-200");
    }
    if (specialEventType === 'recesso') {
      return cn(baseStyles, "bg-orange-50 border-orange-200");
    }
    
    return cn(baseStyles, "bg-white border-gray-200 hover:border-gray-300 shadow-sm");
  };

  return (
    <div className="bg-gray-50 p-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day);
          
          return (
            <div 
              key={dayIndex} 
              className={getDayCardStyles(day)}
              onClick={onDateClick ? () => onDateClick(day) : undefined}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-500">{daysOfWeek[dayIndex]}</span>
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200",
                  isToday(day) ? "bg-blue-600 text-white shadow-lg" : "text-gray-800"
                )}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-1 flex-grow overflow-y-auto">
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
