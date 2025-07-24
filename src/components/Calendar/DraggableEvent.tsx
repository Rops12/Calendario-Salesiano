import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { EventCard } from './EventCard';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function DraggableEvent({ event, index, onClick, isDraggable = true }: DraggableEventProps) {
  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(isDraggable ? provided.dragHandleProps : {})}
          className={cn(
            snapshot.isDragging && "shadow-xl scale-105 rotate-1 z-50 ring-2 ring-blue-300"
          )}
        >
          <EventCard 
            event={event} 
            onClick={onClick}
          />
        </div>
      )}
    </Draggable>
  );
}
