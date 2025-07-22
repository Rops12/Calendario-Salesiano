import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onNewEventClick?: (date: Date) => void;
}

// Função de estilo unificada, inspirada no DraggableEvent
const getEventStyles = (event: CalendarEvent) => {
    const baseStyles = "p-4 rounded-lg cursor-pointer transition-all duration-200 border-l-4";
    
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

export function AgendaView({ 
  currentDate, 
  events, 
  selectedCategories, 
  onEventClick,
  onNewEventClick
}: AgendaViewProps) {
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    }).sort((a, b) => a.title.localeCompare(b.title));
  };

  const getCategoryData = (category: EventCategory) => {
    return eventCategories.find(cat => cat.value === category);
  };

  const todayEvents = getEventsForDate(currentDate);

  return (
    <div className="bg-card shadow-soft animate-fade-in">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full font-semibold bg-primary text-primary-foreground">
              {currentDate.getDate()}
            </div>
            <div>
              <h3 className="font-semibold text-xl text-primary">
                {format(currentDate, 'EEEE', { locale: ptBR })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-lg">
                <CalendarX className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-muted-foreground text-lg font-medium">
                  Nenhum evento para este dia
                </div>
                {onNewEventClick && (
                  <Button onClick={() => onNewEventClick(currentDate)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Evento
                  </Button>
                )}
              </div>
            ) : (
              todayEvents.map((event) => {
                const categoryData = getCategoryData(event.category);

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "hover:scale-[1.02] hover:shadow-medium",
                      getEventStyles(event)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-foreground mb-1 break-words whitespace-normal leading-tight">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-xs text-muted-foreground break-words whitespace-normal leading-tight mb-2">
                            {event.description}
                          </p>
                        )}
                        <div className="text-xs opacity-75 leading-tight">
                          {categoryData?.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
