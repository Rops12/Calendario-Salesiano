import { Draggable } from '@hello-pangea/dnd';
import { CalendarEvent, EventCategory, EventType } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DraggableEventProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function DraggableEvent({ event, index, onClick, isDraggable = true }: DraggableEventProps) {
  const getEventTypeStyles = (eventType: EventType) => {
    // Mantém fundos especiais para feriados e recessos
    switch (eventType) {
      case 'feriado':
        return 'bg-red-100 text-red-800 border-transparent font-semibold';
      case 'recesso':
        return 'bg-orange-100 text-orange-800 border-transparent font-semibold';
      default:
        // Novo estilo padrão: fundo suave, sem bordas
        return 'bg-muted/50 hover:bg-muted text-card-foreground border-transparent';
    }
  };

  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(isDraggable ? provided.dragHandleProps : {})}
          className={cn(
            "px-2 py-1 rounded text-xs font-medium",
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
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
              {
                'bg-category-geral': event.category === 'geral',
                'bg-category-infantil': event.category === 'infantil', 
                'bg-category-fundamental1': event.category === 'fundamental1',
                'bg-category-fundamental2': event.category === 'fundamental2',
                'bg-category-medio': event.category === 'medio',
                'bg-category-pastoral': event.category === 'pastoral',
                'bg-category-esportes': event.category === 'esportes',
                'bg-category-robotica': event.category === 'robotica',
                'bg-category-biblioteca': event.category === 'biblioteca',
                'bg-category-nap': event.category === 'nap'
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
