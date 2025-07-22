import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, eventCategories, EventCategory } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
  isSpecialDay: boolean;
}

export function DraggableEvent({ event, index, onClick, isDraggable = true, isSpecialDay }: DraggableEventProps) {
  
  const categoryLabel = eventCategories.find(c => c.value === event.category)?.label || event.category;

  const getEventStyles = () => {
    const baseStyles = "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4 flex items-start gap-2";
    
    // Cores baseadas na categoria
    const categoryStyles = {
      geral: "bg-blue-50 text-blue-800 border-l-blue-500 hover:bg-blue-100",
      infantil: "bg-amber-50 text-amber-800 border-l-amber-500 hover:bg-amber-100",
      fundamental1: "bg-green-50 text-green-800 border-l-green-500 hover:bg-green-100",
      fundamental2: "bg-cyan-50 text-cyan-800 border-l-cyan-500 hover:bg-cyan-100",
      medio: "bg-purple-50 text-purple-800 border-l-purple-500 hover:bg-purple-100",
      pastoral: "bg-pink-50 text-pink-800 border-l-pink-500 hover:bg-pink-100",
      esportes: "bg-orange-50 text-orange-800 border-l-orange-500 hover:bg-orange-100",
      robotica: "bg-indigo-50 text-indigo-800 border-l-indigo-500 hover:bg-indigo-100",
      biblioteca: "bg-emerald-50 text-emerald-800 border-l-emerald-500 hover:bg-emerald-100",
      nap: "bg-rose-50 text-rose-800 border-l-rose-500 hover:bg-rose-100"
    };

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

    return cn(baseStyles, categoryStyles[event.category] || categoryStyles.geral);
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
          <div className="flex flex-col gap-1 flex-grow">
            <div className="font-bold text-xs leading-tight">
              {event.title}
            </div>
            <div className="text-xs opacity-75 leading-tight">
              {categoryLabel}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
