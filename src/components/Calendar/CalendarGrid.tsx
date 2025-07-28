// src/components/Calendar/CalendarGrid.tsx
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { DraggableEvent } from './DraggableEvent';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { EventCard } from './EventCard';
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onAddNewEvent: (date: Date) => void;
  onEventDrop?: (eventId: string, newDate: string) => void;
}

export function CalendarGrid({
  currentDate,
  events,
  selectedCategories,
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
        <div className="px-6 py-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-3">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const dateStr = date.toISOString().split('T')[0];
              
              return (
                <AnimatedModal
                  key={index}
                  className="max-h-[80vh] flex flex-col"
                  trigger={
                    <Droppable droppableId={`day-${dateStr}`}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "group relative min-h-[140px] p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border text-left",
                            isToday(date) ? "bg-blue-50 border-blue-200 shadow-blue-100" :
                            !isCurrentMonth(date) ? "bg-gray-50 text-gray-400 border-gray-100" :
                            "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                          )}
                        >
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
                              <DraggableEvent key={event.id} event={event} index={eventIndex} onClick={onEventClick} isDraggable={!!onEventDrop} />
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
                  }
                >
                  <DialogHeader className="p-6 pb-4 relative">
                    <DialogTitle>{format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}</DialogTitle>
                    <DialogDescription>{dayEvents.length} evento(s) encontrado(s).</DialogDescription>
                     <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </DialogClose>
                  </DialogHeader>
                  <div className="py-4 px-6 space-y-3 flex-grow overflow-y-auto">
                    {dayEvents.length > 0 ? (
                      dayEvents.map(event => (
                        <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} className="hover:scale-[1.02] hover:shadow-medium" />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Nenhum evento para este dia.</p>
                    )}
                  </div>
                  <div className="p-6 pt-4">
                    <Button onClick={() => onAddNewEvent(date)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
                    </Button>
                  </div>
                </AnimatedModal>
              );
            })}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}