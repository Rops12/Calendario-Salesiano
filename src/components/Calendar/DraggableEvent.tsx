import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, eventCategories, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
  isSpecialDay: boolean;
}

export function DraggableEvent({ event, index, onClick, isDraggable = true, isSpecialDay }: DraggableEventProps) {
  
  const categoryLabel = eventCategories.find(c => c.value === event.category)?.label || event.category;

  const getEventItemStyles = () => {
    if (isSpecialDay) {
        let bgColor = 'bg-white/80';
        if (event.eventType === 'feriado') bgColor = 'bg-red-300/80';
        if (event.eventType === 'recesso') bgColor = 'bg-orange-300/80';
        if (event.eventType === 'evento') bgColor = 'bg-blue-300/80';

        return `${bgColor} text-gray-800`;
    }
    return 'bg-transparent';
  }

  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(isDraggable ? provided.dragHandleProps : {})}
          className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            "transition-all duration-200 break-words whitespace-normal leading-tight",
            isDraggable ? "cursor-pointer" : "cursor-default",
            snapshot.isDragging && "shadow-strong scale-105 rotate-2 z-50",
            getEventItemStyles()
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!snapshot.isDragging) {
              onClick(event);
            }
          }}
        >
            <div className="flex items-start gap-1.5">
                {!isSpecialDay && (
                     <div className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
                        `bg-category-${event.category}`
                      )} />
                )}
                <div className="flex-1 text-xs leading-tight">
                    <div className="font-bold">{event.title}</div>
                    <div className={cn("text-xs", isSpecialDay ? "opacity-80" : "opacity-60")}>{categoryLabel}</div>
                </div>
            </div>
        </div>
      )}
    </Draggable>
  );
}
