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
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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

  const getDayCardStyles = (date: Date, eventType: string | null) => {
    const baseStyles = "group relative min-h-[140px] p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border";
    
    if (isToday(date)) {
      return cn(baseStyles, "bg-blue-50 border-blue-200 shadow-blue-100");
    }
    
    if (!isCurrentMonth(date)) {
      return cn(baseStyles, "bg-gray-50 text-gray-400 border-gray-100");
    }
    
    return cn(baseStyles, "bg-white border-gray-200 hover:border-gray-300 shadow-sm");
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
      <div className="bg-gray-50 min-h-screen">
        {/* ALTERAÇÃO AQUI: Removido max-w-7xl e mx-auto */}
        <div className="px-6 py-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {daysOfWeek.map((day) => (
              <div 
                key={day} 
                className="text-center font-semibold text-gray-700 py-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-4">
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
                      className={getDayCardStyles(date, specialEventType)}
                      onClick={() => onDateClick(date)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 bg-white shadow-sm hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddNewEvent(date);
                        }}
                        aria-label="Adicionar novo evento"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-3 transition-all duration-200",
                        isToday(date) && "bg-blue-600 text-white shadow-lg",
                        !isToday(date) && isCurrentMonth(date) && "text-gray-800 hover:bg-gray-100",
                        !isCurrentMonth(date) && "text-gray-400"
                      )}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <DraggableEvent
                            key={event.id}
                            event={event}
                            index={eventIndex}
                            onClick={onEventClick}
                            isDraggable={!!onEventDrop}
                            isSpecialDay={!!specialEventType}
                          />
                        ))}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-md">
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
