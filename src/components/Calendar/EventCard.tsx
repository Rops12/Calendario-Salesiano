// src/components/Calendar/EventCard.tsx
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories.tsx';

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  const { getCategory } = useCategories();
  const categoryInfo = getCategory(event.category);

  // Lógica de Fallback: Se a categoria não for encontrada, usa um padrão.
  const safeCategoryInfo = categoryInfo || {
    label: event.category.charAt(0).toUpperCase() + event.category.slice(1),
    color: '#9ca3af', // Cinza neutro
  };

  const getEventStyles = () => {
    const baseStyles = "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4 flex items-start gap-2";
    
    if (event.eventType === 'feriado') return cn(baseStyles, "bg-red-100 text-red-900 border-l-red-500 font-semibold hover:bg-red-200");
    if (event.eventType === 'recesso') return cn(baseStyles, "bg-orange-100 text-orange-900 border-l-orange-500 font-semibold hover:bg-orange-200");
    if (event.eventType === 'evento') return cn(baseStyles, "bg-yellow-100 text-yellow-900 border-l-yellow-500 font-semibold hover:bg-yellow-200");

    // Estilo padrão usa a cor da categoria vinda do banco de dados
    return cn(baseStyles, "text-white hover:opacity-90");
  };
  
  const cardStyle = event.eventType === 'normal'
    ? { backgroundColor: safeCategoryInfo.color, borderColor: safeCategoryInfo.color }
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
        <div className="text-xs opacity-75 leading-tight">
          {safeCategoryInfo.label}
        </div>
      </div>
    </div>
  );
}
