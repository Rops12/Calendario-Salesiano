// src/components/Calendar/EventCard.tsx
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories.tsx'; // Importado

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  const { getCategory } = useCategories(); // Usando o hook
  const categoryInfo = getCategory(event.category);

  const getEventStyles = () => {
    const baseStyles = "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4 flex items-start gap-2";
    
    // Estilos especiais para tipos de evento
    if (event.eventType === 'feriado') {
      return cn(baseStyles, "bg-red-100 text-red-900 border-l-red-500 font-semibold hover:bg-red-200");
    }
    if (event.eventType === 'recesso') {
      return cn(baseStyles, "bg-orange-100 text-orange-900 border-l-orange-500 font-semibold hover:bg-orange-200");
    }
    if (event.eventType === 'evento') {
      return cn(baseStyles, "bg-yellow-100 text-yellow-900 border-l-yellow-500 font-semibold hover:bg-yellow-200");
    }

    // Estilos dinâmicos baseados na cor da categoria do DB
    if (categoryInfo) {
      return cn(baseStyles, "text-white hover:opacity-90");
    }
    
    // Fallback
    return cn(baseStyles, "bg-gray-100 text-gray-800 border-l-gray-500 hover:bg-gray-200");
  };
  
  const cardStyle = categoryInfo && event.eventType === 'normal'
    ? { backgroundColor: categoryInfo.color, borderColor: categoryInfo.color }
    : {};

  return (
    <div
      className={cn(getEventStyles(), className)}
      style={cardStyle}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      {event.eventType === 'evento' && <Star className="w-3 h-3 mt-0.5 text-yellow-600 flex-shrink-0" />}
      <div className="flex flex-col gap-1 flex-grow">
        <div className="font-bold text-xs leading-tight">
          {event.title}
        </div>
        {categoryInfo && (
          <div className="text-xs opacity-75 leading-tight">
            {categoryInfo.label}
          </div>
        )}
      </div>
    </div>
  );
}
