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
      // Ajuste para lidar com `category` sendo um array no form mas uma string no evento
      const eventCategory = Array.isArray(event.category) ? event.category[0] : event.category;
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(eventCategory);
    });
  };

  const getSpecialEventType = (date: Date): 'feriado' | 'recesso' | 'evento' | null => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.some(e => e.eventType === 'feriado')) return 'feriado';
    if (dayEvents.some(e => e.eventType === 'recesso')) return 'recesso';
    if (dayEvents.some(e => e.eventType === 'evento')) return 'evento';
    return null;
  };

  const getDayCardStyles = (date: Date, eventType: string | null) => {
    // Estilos para dias normais e dia atual, sem eventos especiais
    if (!eventType) {
      if (isToday(date)) return 'bg-white ring-2 ring-blue-500'; // Dia atual com borda azul
      if (!isCurrentMonth(date)) return 'bg-gray-100 text-gray-400';
      return 'bg-gray-50'; // Cor para dias normais
    }
    // Retornaremos uma string vazia para os dias especiais por enquanto
    return '';
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
                className="p-4 text-center font-semibold text-gray-700"
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
                        "group relative min-h-[140px] p-2 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                        getDayCardStyles(date, specialEventType)
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
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-2 transition-all duration-200",
                        isToday(date) && "bg-blue-600 text-white",
                        !isToday(date) && isCurrentMonth(date) && "text-gray-800",
                        !isCurrentMonth(date) && "text-gray-400"
                      )}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.map((event, eventIndex) => (
                          <DraggableEvent
                            key={event.id}
                            event={event}
                            index={eventIndex}
                            onClick={onEventClick}
                            isDraggable={!!onEventDrop}
                            isSpecialDay={!!specialEventType}
                          />
                        ))}
                        
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
