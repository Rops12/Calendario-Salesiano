import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { DraggableEvent } from './DraggableEvent';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (eventId: string, newDate: string) => void;
}

export function CalendarGrid({ 
  currentDate, 
  events, 
  selectedCategories, 
  onEventClick, 
  onDateClick,
  onEventDrop
}: CalendarGridProps) {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
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
      
      // Check if the date falls within the event range
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    });
  };

  const getSpecialEventType = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const specialEvent = events.find(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      
      return dateStr >= eventStartDate && 
             dateStr <= eventEndDate && 
             (event.eventType === 'feriado' || event.eventType === 'recesso' || event.eventType === 'evento') &&
             selectedCategories.includes(event.category);
    });
    
    return specialEvent?.eventType || null;
  };

  const getCategoryColor = (category: EventCategory) => {
    const categoryData = eventCategories.find(cat => cat.value === category);
    return categoryData?.color || 'category-geral';
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onEventDrop) return;

    const { draggableId, destination } = result;
    const [, dateStr] = destination.droppableId.split('-');
    
    if (dateStr) {
      onEventDrop(draggableId, dateStr);
    }
  };

  const getDateDisplay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const specialEvent = events.find(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      
      return dateStr >= eventStartDate && 
             dateStr <= eventEndDate && 
             (event.eventType === 'feriado' || event.eventType === 'recesso') &&
             selectedCategories.includes(event.category);
    });

    if (specialEvent) {
      const eventStart = specialEvent.startDate.split('T')[0];
      const eventEnd = specialEvent.endDate ? specialEvent.endDate.split('T')[0] : eventStart;
      
      if (dateStr === eventStart && dateStr === eventEnd) {
        // Single day event
        return specialEvent.eventType === 'feriado' ? '🎉' : '🏖️';
      } else if (dateStr === eventStart) {
        // Start of multi-day event
        return specialEvent.eventType === 'feriado' ? '🎉' : '🏖️';
      } else if (dateStr === eventEnd) {
        // End of multi-day event
        return specialEvent.eventType === 'feriado' ? '🎉' : '🏖️';
      } else {
        // Middle of multi-day event
        return specialEvent.eventType === 'feriado' ? '📅' : '⏸️';
      }
    }
    
    return null;
  };

  const getDayBackgroundStyles = (eventType: string | null) => {
    switch (eventType) {
      case 'feriado':
        return 'bg-destructive/10 border-destructive/30';
      case 'recesso':
        return 'bg-category-esportes/10 border-category-esportes/30';
      case 'evento':
        return 'bg-primary/10 border-primary/30';
      default:
        return '';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-card shadow-medium rounded-lg overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-border/50">
            {daysOfWeek.map((day) => (
              <div 
                key={day} 
                className="p-4 text-center font-semibold text-foreground bg-muted/30 border-r border-border/30 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const dateStr = date.toISOString().split('T')[0];
              const specialEventType = getSpecialEventType(date);
              
              return (
                <Droppable droppableId={`day-${dateStr}`} key={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[120px] p-3 border-r border-b border-border/30 cursor-pointer transition-all duration-200 relative",
                        "hover:bg-muted/30 hover:shadow-soft last:border-r-0",
                        !isCurrentMonth(date) && "bg-muted/10 text-muted-foreground/70",
                        isToday(date) && "bg-primary/10 border-primary/40 shadow-soft",
                        specialEventType && getDayBackgroundStyles(specialEventType),
                        snapshot.isDraggingOver && "bg-primary/20 border-primary/50 scale-[1.01] shadow-medium ring-2 ring-primary/30"
                      )}
                      onClick={onDateClick ? () => onDateClick(date) : undefined}
                    >
                      {snapshot.isDraggingOver && (
                        <div className="absolute inset-0 border-2 border-dashed border-primary/60 rounded-lg bg-primary/5 flex items-center justify-center">
                          <div className="text-primary text-sm font-medium bg-white/90 px-2 py-1 rounded shadow">
                            Soltar aqui
                          </div>
                        </div>
                      )}
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-3 transition-all duration-200 relative hover:scale-110",
                        isToday(date) && "bg-primary text-primary-foreground shadow-medium ring-2 ring-primary/20",
                        !isToday(date) && isCurrentMonth(date) && "text-foreground hover:bg-primary/10",
                        !isCurrentMonth(date) && "text-muted-foreground/50"
                      )}>
                        {date.getDate()}
                        {getDateDisplay(date) && (
                          <span className="absolute -top-1 -right-1 text-xs">
                            {getDateDisplay(date)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <DraggableEvent
                            key={event.id}
                            event={event}
                            index={eventIndex}
                            onClick={onEventClick}
                            isDraggable={!!onEventDrop}
                          />
                        ))}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                            +{dayEvents.length - 3} mais
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