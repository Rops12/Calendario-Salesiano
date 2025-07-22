import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, eventCategories, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
  isSpecialDay: boolean; // Prop para diferenciar o estilo
}

export function DraggableEvent({ event, index, onClick, isDraggable = true, isSpecialDay }: DraggableEventProps) {
  
  const categoryLabel = eventCategories.find(c => c.value === event.category)?.label || event.category;

  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(isDraggable ? provided.dragHandleProps : {})}
          className={cn(
            "px-2 py-1.5 rounded-md text-xs font-medium", // Arredondamento do item
            "transition-all duration-200 break-words whitespace-normal leading-tight",
            isDraggable ? "cursor-pointer" : "cursor-default",
            snapshot.isDragging && "shadow-strong scale-105 rotate-2 z-50",
            !isSpecialDay && "bg-transparent" // Fundo transparente para dias normais
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!snapshot.isDragging) {
              onClick(event);
            }
          }}
        >
            <div className="flex items-start gap-1.5">
                <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
                    `bg-category-${event.category}` // Ponto colorido
                  )} />
                <div className="flex-1 text-xs leading-tight text-gray-800">
                    <div className="font-bold">{event.title}</div>
                    <div className="text-xs opacity-80">{categoryLabel}</div>
                </div>
            </div>
        </div>
      )}
    </Draggable>
  );
}
