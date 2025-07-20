import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, EventCategory, eventCategories, EventType } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
}

export function DraggableEvent({ event, index, onClick }: DraggableEventProps) {
  const getCategoryColor = (category: EventCategory) => {
    const categoryData = eventCategories.find(cat => cat.value === category);
    return categoryData?.color || 'category-geral';
  };


  const getEventTypeStyles = (eventType: EventType, category: EventCategory) => {
    switch (eventType) {
      case 'feriado':
        return 'bg-red-100 text-red-800 border-red-200 font-semibold';
      case 'recesso':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
      default:
        const categoryStyles = {
          geral: 'bg-blue-100 text-blue-800 border-blue-200',
          infantil: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          fundamental1: 'bg-green-100 text-green-800 border-green-200',
          fundamental2: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          medio: 'bg-purple-100 text-purple-800 border-purple-200',
          pastoral: 'bg-pink-100 text-pink-800 border-pink-200',
          esportes: 'bg-orange-100 text-orange-800 border-orange-200',
          robotica: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          biblioteca: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          nap: 'bg-rose-100 text-rose-800 border-rose-200'
        };
        return categoryStyles[category] || categoryStyles.geral;
    }
  };

  

  return (
    <Draggable draggableId={event.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "px-2 py-1 rounded text-xs font-medium cursor-pointer border",
            "transition-all duration-200 hover:scale-105 hover:shadow-medium",
            "break-words whitespace-normal leading-tight min-h-[1.5rem]",
            getEventTypeStyles(event.eventType, event.category),
            snapshot.isDragging && "shadow-strong scale-105 rotate-2 z-50"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!snapshot.isDragging) {
              onClick(event);
            }
          }}
        >
          <div className="flex items-start gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
              {
                'bg-blue-500': event.category === 'geral',
                'bg-yellow-500': event.category === 'infantil', 
                'bg-green-500': event.category === 'fundamental1',
                'bg-cyan-500': event.category === 'fundamental2',
                'bg-purple-500': event.category === 'medio',
                'bg-pink-500': event.category === 'pastoral',
                'bg-orange-500': event.category === 'esportes',
                'bg-indigo-500': event.category === 'robotica',
                'bg-emerald-500': event.category === 'biblioteca',
                'bg-rose-500': event.category === 'nap'
              }
            )} />
            <span className="flex-1 text-xs leading-tight">
              {event.title}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}