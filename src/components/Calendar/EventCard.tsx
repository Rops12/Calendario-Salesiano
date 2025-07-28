// src/components/Calendar/EventCard.tsx

import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { CalendarEvent } from "@/types/calendar";
import { Star } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  const { getCategory } = useCategories();
  const categoryInfo = getCategory(event.category);

  const safeCategoryInfo = categoryInfo || {
    value: "default",
    label: "Sem categoria",
    color: "hsl(220, 13%, 69%)",
    isActive: true,
  };
  
  const hslColorValue = safeCategoryInfo.color.match(/\d+/g)?.join(" ") || "220 13% 69%";

  const cardStyle = {
    '--category-color-hsl': hslColorValue,
    '--category-color': `hsl(${hslColorValue})`,
    '--category-text-color': '#FFFFFF',
  } as React.CSSProperties;

  const getEventCardClasses = () => {
    // AJUSTE: Trocamos 'group' por 'group/card' para nomear o grupo
    const baseStyles = "group/card px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4 flex items-start gap-2";

    if (event.eventType === 'feriado') return cn(baseStyles, "bg-red-100 text-red-900 border-l-red-500 font-semibold hover:bg-red-200");
    if (event.eventType === 'recesso') return cn(baseStyles, "bg-orange-100 text-orange-900 border-l-orange-500 font-semibold hover:bg-orange-200");
    if (event.eventType === 'evento') return cn(baseStyles, "bg-yellow-100 text-yellow-900 border-l-yellow-500 font-semibold hover:bg-yellow-200");

    return cn(
      baseStyles,
      "border-[var(--category-color)]",
      "bg-[hsl(var(--category-color-hsl),0.15)]",
      "hover:bg-[var(--category-color)]" // O hover do fundo do card continua normal
    );
  };
  
  const getTitleClasses = () => {
    if (event.eventType !== 'normal') {
      return "font-bold text-xs leading-tight";
    }
    
    // AJUSTE: Trocamos 'group-hover' por 'group-hover/card'
    return cn(
      "font-bold text-xs leading-tight",
      "text-[var(--category-color)]",
      "group-hover/card:text-[var(--category-text-color)]" // Agora só ativa no hover do card do evento
    );
  }

  return (
    <div
      className={cn(getEventCardClasses(), className)}
      style={cardStyle}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      {event.eventType === 'evento' && <Star className="w-3 h-3 mt-0.5 text-yellow-600 flex-shrink-0" />}
      <div className="flex flex-col gap-1 flex-grow">
        <div className={getTitleClasses()}>
          {event.title}
        </div>
        {/* AJUSTE: Trocamos 'group-hover' por 'group-hover/card' */}
        <div className="text-xs opacity-75 leading-tight text-gray-600 group-hover/card:text-gray-200">
          {safeCategoryInfo.label}
        </div>
      </div>
    </div>
  );
}
