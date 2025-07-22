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

  const getEventTypeStyles = (event: CalendarEvent) => {
    switch (event.eventType) {
      case 'feriado':
        return 'bg-red-100 text-red-800 border-red-200 font-semibold';
      case 'recesso':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
      default: // normal e evento
        return 'bg-card hover:bg-muted/50 text-card-foreground border';
    }
  };

  return (
    <div className="bg-card shadow-soft animate-fade-in">
      {/* ALTERAÇÃO AQUI: Removido max-w- e mx-auto do contêiner principal */}
      <div className="p-6">
        {/* Adicionado um contêiner interno para limitar a largura do conteúdo da agenda */}
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
                        "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                        "hover:scale-[1.02] hover:shadow-medium",
                        getEventTypeStyles(event)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1 break-words whitespace-normal leading-tight">
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground break-words whitespace-normal leading-tight mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                              // Usando cores mais sutis para os badges no fundo neutro
                              'bg-muted text-muted-foreground'
                            )}>
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                {
                                  'bg-category-geral': event.category === 'geral',
                                  'bg-category-infantil': event.category === 'infantil', 
                                  'bg-category-fundamental1': event.category === 'fundamental1',
                                  'bg-category-fundamental2': event.category === 'fundamental2',
                                  'bg-category-medio': event.category === 'medio',
                                  'bg-category-pastoral': event.category === 'pastoral',
                                  'bg-category-esportes': event.category === 'esportes',
                                  'bg-category-robotica': event.category === 'robotica',
                                  'bg-category-biblioteca': event.category === 'biblioteca',
                                  'bg-category-nap': event.category === 'nap'
                                }
                              )} />
                              {categoryData?.label}
                            </span>
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
