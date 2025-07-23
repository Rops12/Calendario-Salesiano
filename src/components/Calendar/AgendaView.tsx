import { CalendarEvent, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from './EventCard'; // Usando o novo componente simples

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onNewEventClick?: (date: Date) => void;
}

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

  const todayEvents = getEventsForDate(currentDate);

  return (
    <div className="bg-gray-50 p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg font-semibold bg-primary text-primary-foreground text-xl">
            {currentDate.getDate()}
          </div>
          <div>
            <h3 className="font-semibold text-2xl text-primary capitalize">
              {format(currentDate, 'EEEE', { locale: ptBR })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {todayEvents.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-lg bg-white">
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
            todayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={onEventClick}
                className="hover:scale-[1.02] hover:shadow-medium"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
