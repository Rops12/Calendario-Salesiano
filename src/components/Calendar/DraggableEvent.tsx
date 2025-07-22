import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, eventCategories } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function DraggableEvent({ event, index, onClick, isDraggable = true }: DraggableEventProps) {
  
  const categoryInfo = eventCategories.find(c => c.value === event.category);

  const getEventStyles = () => {
    const baseStyles = "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4 flex items-start gap-2";
    
    // Estilos especiais para tipos de evento
    if (event.eventType === 'feriado') {
      return cn(baseStyles, "bg-red-100 text-red-900 border-l-red-500 font-semibold");
    }
    if (event.eventType === 'recesso') {
      return cn(baseStyles, "bg-orange-100 text-orange-900 border-l-orange-500 font-semibold");
    }
    if (event.eventType === 'evento') {
      return cn(baseStyles, "bg-yellow-100 text-yellow-900 border-l-yellow-500 font-semibold");
    }

    // Estilos padrão de categoria
    if (categoryInfo) {
      const { background, foreground, border, hoverBackground } = categoryInfo.tw;
      return cn(baseStyles, background, foreground, border, hoverBackground);
    }
    
    // Fallback
    return cn(baseStyles, "bg-gray-100 text-gray-800 border-l-gray-500 hover:bg-gray-200");
  };

  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(isDraggable ? provided.dragHandleProps : {})}
          className={cn(
            getEventStyles(),
            snapshot.isDragging && "shadow-xl scale-105 rotate-1 z-50 ring-2 ring-blue-300"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!snapshot.isDragging) {
              onClick(event);
            }
          }}
        >
          {event.eventType === 'evento' && <Star className="w-3 h-3 mt-0.5 text-yellow-600 flex-shrink-0" />}
          <div className="flex-grow font-bold leading-tight">
            {event.title}
          </div>
        </div>
      )}
    </Draggable>
  );
}
