import { CalendarEvent, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { EventCard } from './EventCard';
import { useFloatingPanel } from '@/components/ui/floating-panel';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMobile } from '@/hooks/use-mobile';

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
}: WeekViewProps) {
  const { openFloatingPanel } = useFloatingPanel();
  const isMobile = useMobile();

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
    const baseStyles = "group relative p-3 rounded-xl transition-colors duration-200 border flex flex-col min-h-[150px]";
    const specialEventType = getSpecialEventType(date);

    if (isToday(date)) return cn(baseStyles, "bg-blue-50 border-blue-200");
    if (specialEventType === 'feriado') return cn(baseStyles, "bg-red-50 border-red-200");
    if (specialEventType === 'recesso') return cn(baseStyles, "bg-orange-50 border-orange-200");
    return cn(baseStyles, "bg-white border-gray-200");
  };

  return (
    <div className="bg-gray-50 p-2 sm:p-4 md:p-6 animate-fade-in">
        <div className="hidden md:grid grid-cols-7 gap-4 mb-2">
            {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center font-bold text-gray-600 capitalize">
                    {format(day, 'EEEE', { locale: ptBR })}
                </div>
            ))}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={dayIndex}
              className={getDayCardStyles(day)}
              onClick={(e) => {
                if (isMobile) {
                  openFloatingPanel(e.currentTarget.getBoundingClientRect(), day, dayEvents);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                  isToday(day) ? "bg-blue-600 text-white" : "text-gray-800"
                )}>
                  {day.getDate()}
                </div>
                <span className="font-semibold capitalize text-gray-700 md:hidden">
                    {format(day, 'EEEE', { locale: ptBR })}
                </span>
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
