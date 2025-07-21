import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { DraggableEvent } from './DraggableEvent';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onAddNewEvent: (date: Date) => void;
  onEventDrop?: (eventId: string, newDate: string) => void;
}

export function CalendarGrid({
  currentDate,
  events,
  selectedCategories,
  onEventClick,
  onDateClick,
  onAddNewEvent,
  onEventDrop
}: CalendarGridProps) {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const gridStartDate = new Date(startOfMonth);
  gridStartDate.setDate(gridStartDate.getDate() - startOfMonth.getDay());

  const gridEndDate = new Date(endOfMonth);
  gridEndDate.setDate(gridEndDate.getDate() + (6 - endOfMonth.getDay()));

  const days = [];
  let current = new Date(gridStartDate);

  while (current <= gridEndDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    });
  };

  const getSpecialEventType = (date: Date): 'feriado' | 'recesso' | 'evento' | null => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.some(e => e.eventType === 'feriado')) return 'feriado';
    if (dayEvents.some(e => e.eventType === 'recesso')) return 'recesso';
    if (dayEvents.some(e => e.eventType === 'evento')) return 'evento';
    return null;
  };

  const getDayBackgroundStyles = (eventType: string | null) => {
    // Usando cores mais suaves (opacidade de 5%)
    switch (eventType) {
      case 'feriado':
        return 'bg-destructive/5';
      case 'recesso':
        return 'bg-category-esportes/5'; // Laranja suave
      case 'evento':
        return 'bg-category-fundamental1/5'; // Verde suave
      default:
        return '';
    }
  };
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onEventDrop) return;

    const { draggableId, destination } = result;
    const [, dateStr] = destination.droppableId.split('-');
    
    if (dateStr) {
      onEventDrop(draggableId, dateStr);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-transparent animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Header */}
          <div className="grid grid-cols-7">
            {daysOfWeek.map((day) => (
              <div 
                key={day} 
                className="p-4 text-center font-semibold text-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const dateStr = date.toISOString().split('T')[0];
              const specialEventType = getSpecialEventType(date);
              
              return (
                <Droppable droppableId={`day-${dateStr}`} key={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "group relative min-h-[120px] p-3 rounded-lg bg-card shadow-soft cursor-pointer transition-all duration-200 hover:shadow-strong hover:-translate-y-1",
                        !isCurrentMonth(date) && "bg-muted/40 text-muted-foreground/70",
                        // Aplica o estilo do dia atual somente se não for um dia com evento especial
                        !specialEventType && isToday(date) && "bg-primary/10 ring-2 ring-primary/40",
                        // Aplica o novo estilo para dias com eventos especiais
                        specialEventType && getDayBackgroundStyles(specialEventType),
                      )}
                      onClick={() => onDateClick(date)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddNewEvent(date);
                        }}
                        aria-label="Adicionar novo evento"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-3 transition-all duration-200",
                        isToday(date) && "bg-primary text-primary-foreground",
                        !isToday(date) && isCurrentMonth(date) && "text-foreground",
                        !isCurrentMonth(date) && "text-muted-foreground/50"
                      )}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, eventIndex) => (
                          <DraggableEvent
                            key={event.id}
                            event={event}
                            index={eventIndex}
                            onClick={onEventClick}
                            isDraggable={!!onEventDrop}
                          />
                        ))}
                        
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
