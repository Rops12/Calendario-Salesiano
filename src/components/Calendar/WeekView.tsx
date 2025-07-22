import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

// Função de estilo unificada, inspirada no DraggableEvent
const getEventStyles = (event: CalendarEvent) => {
    const baseStyles = "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4";
    
    const categoryStyles = {
      geral: "bg-blue-50 text-blue-800 border-l-blue-500 hover:bg-blue-100",
      infantil: "bg-amber-50 text-amber-800 border-l-amber-500 hover:bg-amber-100",
      fundamental1: "bg-green-50 text-green-800 border-l-green-500 hover:bg-green-100",
      fundamental2: "bg-cyan-50 text-cyan-800 border-l-cyan-500 hover:bg-cyan-100",
      medio: "bg-purple-50 text-purple-800 border-l-purple-500 hover:bg-purple-100",
      pastoral: "bg-pink-50 text-pink-800 border-l-pink-500 hover:bg-pink-100",
      esportes: "bg-orange-50 text-orange-800 border-l-orange-500 hover:bg-orange-100",
      robotica: "bg-indigo-50 text-indigo-800 border-l-indigo-500 hover:bg-indigo-100",
      biblioteca: "bg-emerald-50 text-emerald-800 border-l-emerald-500 hover:bg-emerald-100",
      nap: "bg-rose-50 text-rose-800 border-l-rose-500 hover:bg-rose-100"
    };

    if (event.eventType === 'feriado') {
      return cn(baseStyles, "bg-red-100 text-red-800 border-l-red-500 font-bold");
    }
    if (event.eventType === 'recesso') {
      return cn(baseStyles, "bg-orange-100 text-orange-800 border-l-orange-500 font-bold");
    }

    return cn(baseStyles, categoryStyles[event.category] || categoryStyles.geral);
};

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
    });
  };

  return (
    <div className="bg-card shadow-soft animate-fade-in">
      <div className="">
        {/* Week Header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day, index) => (
            <div 
              key={index}
              className={cn(
                "p-4 text-center border-r bg-muted/50 cursor-pointer hover:bg-muted transition-colors",
                isToday(day) && "bg-blue-50 border-b-2 border-blue-200"
              )}
                onClick={onDateClick ? () => onDateClick(day) : undefined}
            >
              <div className="font-medium text-sm text-muted-foreground">
                {daysOfWeek[index]}
              </div>
              <div className={cn(
                "text-lg font-semibold mt-1",
                isToday(day) && "text-blue-600"
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
                    isToday(day) && "bg-blue-50/50"
                  )}
                  onClick={() => onDateClick(day)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                       const categoryLabel = eventCategories.find(c => c.value === event.category)?.label || event.category;
                       return (
                        <div
                          key={event.id}
                          className={cn(
                            getEventStyles(event),
                            "hover:scale-100" // Desativar o scale para não cortar na visualização de semana
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-xs leading-tight">
                              {event.title}
                            </div>
                            <div className="text-xs opacity-75 leading-tight">
                              {categoryLabel}
                            </div>
                          </div>
                        </div>
                       )
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
