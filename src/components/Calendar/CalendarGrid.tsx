import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { DraggableEvent } from './DraggableEvent';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFloatingPanel } from '@/components/ui/floating-panel';
import { format, isSameMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddNewEvent: (date: Date) => void;
  onEventDrop?: (eventId: string, newDate: string) => void;
}

export function CalendarGrid({
  currentDate,
  events,
  onEventClick,
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

  const { openFloatingPanel } = useFloatingPanel();

  const isToday = (date: Date) => format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);

  const getEventsForDate = (date: Date) => {
    const dayStart = startOfDay(date);
    return events.filter(event => {
      const eventStart = startOfDay(new Date(event.startDate));
      const eventEnd = event.endDate ? endOfDay(new Date(event.endDate)) : endOfDay(eventStart);
      return isWithinInterval(dayStart, { start: eventStart, end: eventEnd });
    });
  };

  const getSpecialEventType = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const hasFeriado = dayEvents.some(e => e.eventType === 'feriado');
    const hasRecesso = dayEvents.some(e => e.eventType === 'recesso');
    if (hasFeriado) return 'feriado';
    if (hasRecesso) return 'recesso';
    return null;
  };

  const getDayCardStyles = (date: Date, eventType: string | null) => {
    const baseClasses = "relative group flex flex-col p-3 rounded-xl shadow-sm transition-all duration-300 cursor-pointer min-h-[10rem]";
    // --- ANIMAÇÃO DE HOVER RESTAURADA AQUI ---
    const hoverClasses = "hover:shadow-xl hover:-translate-y-1";
    
    if (!isCurrentMonth(date)) {
      return cn(baseClasses, "bg-gray-50 text-gray-400", hoverClasses);
    }
    if (eventType === 'feriado') {
      return cn(baseClasses, "bg-red-50 text-red-800", hoverClasses, "hover:bg-red-100");
    }
    if (eventType === 'recesso') {
      return cn(baseClasses, "bg-yellow-50 text-yellow-800", hoverClasses, "hover:bg-yellow-100");
    }
    return cn(baseClasses, "bg-white", hoverClasses, "hover:bg-gray-50");
    // --- FIM DA ANIMAÇÃO DE HOVER ---
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onEventDrop) return;
    const { droppableId, draggableId } = result;
    const newDateStr = droppableId.replace('day-', '');
    onEventDrop(draggableId, newDateStr);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-gray-50">
        <div className="px-4 sm:px-6 py-6">
          <div className="hidden md:grid grid-cols-7 gap-4 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-3">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const dateStr = format(date, 'yyyy-MM-dd');
              const specialEventType = getSpecialEventType(date);

              return (
                <Droppable droppableId={`day-${dateStr}`} key={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={getDayCardStyles(date, specialEventType)}
                      onClick={(e) => {
                        openFloatingPanel(e.currentTarget.getBoundingClientRect(), date, dayEvents);
                      }}
                    >
                      {onAddNewEvent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 bg-background/60 backdrop-blur-sm shadow-sm hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNewEvent(date);
                          }}
                          aria-label="Adicionar novo evento"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}

                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-3 transition-all duration-300",
                        isToday(date) && "bg-blue-600 text-white shadow-lg",
                        !isToday(date) && isCurrentMonth(date) && "text-gray-800",
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
                          />
                        ))}

                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-md mt-1">
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
