import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';
import { cn } from '@/lib/utils';

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
  
  // Get the start of the week (Sunday)
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
    });
  };

  const getCategoryColor = (category: EventCategory) => {
    const categoryData = eventCategories.find(cat => cat.value === category);
    return categoryData?.color || 'category-geral';
  };

  return (
    <div className="bg-card shadow-soft animate-fade-in">
      {/* ALTERAÇÃO AQUI: Removido max-w-7xl e mx-auto */}
      <div className="">
        {/* Week Header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day, index) => (
            <div 
              key={index}
              className={cn(
                "p-4 text-center border-r bg-muted/50 cursor-pointer hover:bg-muted transition-colors",
                isToday(day) && "bg-primary/10 border-primary/20"
              )}
                onClick={onDateClick ? () => onDateClick(day) : undefined}
            >
              <div className="font-medium text-sm text-muted-foreground">
                {daysOfWeek[index]}
              </div>
              <div className={cn(
                "text-lg font-semibold mt-1",
                isToday(day) && "text-primary"
              )}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week Body */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={dayIndex} className="border-r min-h-[400px]">
                <div 
                  className={cn(
                    "p-2 cursor-pointer hover:bg-muted/30 transition-colors relative min-h-[400px]",
                    isToday(day) && "bg-primary/5"
                  )}
                  onClick={() => onDateClick(day)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event, eventIndex) => {
                      const getEventTypeStyles = () => {
                        switch (event.eventType) {
                          case 'feriado':
                            return 'bg-red-100 text-red-800 border-red-200 font-semibold';
                          case 'recesso':
                            return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
                          case 'evento':
                            return 'bg-blue-100 text-blue-800 border-blue-200 font-semibold';
                          default: // normal
                            const categoryStyles = {
                              geral: 'bg-blue-100 text-blue-800 border-blue-200',
                              infantil: 'bg-amber-100 text-amber-800 border-amber-200',
                              fundamental1: 'bg-green-100 text-green-800 border-green-200',
                              fundamental2: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                              medio: 'bg-purple-100 text-purple-800 border-purple-200',
                              pastoral: 'bg-pink-100 text-pink-800 border-pink-200',
                              esportes: 'bg-orange-100 text-orange-800 border-orange-200',
                              robotica: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                              biblioteca: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                              nap: 'bg-rose-100 text-rose-800 border-rose-200'
                            };
                            return categoryStyles[event.category] || categoryStyles.geral;
                        }
                      };

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "p-2 rounded text-xs font-medium cursor-pointer border mb-1",
                            "transition-all duration-200 hover:scale-105 hover:shadow-medium",
                            "break-words whitespace-normal leading-tight",
                            getEventTypeStyles()
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <div className="flex items-start gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
                              {
                                'bg-blue-500': event.category === 'geral',
                                'bg-yellow-500': event.category === 'infantil', 
                                'bg-green-500': event.category === 'fundamental1',
                                'bg-cyan-500': event.category === 'fundamental2',
                                'bg-purple-500': event.category === 'medio',
                                'bg-pink-500': event.category === 'pastoral',
                                'bg-orange-500': event.category === 'esportes',
                                'bg-indigo-500': event.category === 'robotica',
                                'bg-emerald-500': event.category === 'biblioteca',
                                'bg-rose-500': event.category === 'nap'
                              }
                            )} />
                            <span className="flex-1 text-xs leading-tight">
                              {event.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
