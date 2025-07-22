import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, EventCategory, eventCategories, EventType } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function DraggableEvent({ event, index, onClick, isDraggable = true }: DraggableEventProps) {
  const getEventTypeStyles = (eventType: EventType) => {
    switch (eventType) {
      case 'feriado':
        return 'bg-red-500 text-white border-transparent font-semibold';
      case 'recesso':
        return 'bg-orange-500 text-white border-transparent font-semibold';
      case 'evento':
          return 'bg-blue-500 text-white border-transparent font-semibold';
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-transparent';
    }
  };

  const categoryLabel = eventCategories.find(c => c.value === event.category)?.label || event.category;

  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(isDraggable ? provided.dragHandleProps : {})}
          className={cn(
            "px-2 py-1.5 rounded-lg text-xs font-medium", // Bordas mais arredondadas
            "transition-all duration-200 break-words whitespace-normal leading-tight min-h-[1.5rem]",
            isDraggable ? "cursor-pointer hover:scale-105 hover:shadow-medium" : "cursor-default",
            getEventTypeStyles(event.eventType),
            snapshot.isDragging && "shadow-strong scale-105 rotate-2 z-50"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!snapshot.isDragging) {
              onClick(event);
            }
          }}
        >
          <div className="flex items-start gap-1.5">
            <div className="flex-1 text-xs leading-tight">
              <div className="font-bold">{event.title}</div>
              <div className="text-xs opacity-80">{categoryLabel}</div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
