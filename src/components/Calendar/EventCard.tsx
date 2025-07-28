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

  // Estilos para o container EXTERNO (borda sutil, fundo)
  const getOuterClasses = () => {
    const base = "group/card rounded-lg border transition-all duration-200 cursor-pointer";

    if (event.eventType === 'feriado') return cn(base, "bg-red-100/50 border-red-200/60 hover:bg-red-200");
    if (event.eventType === 'recesso') return cn(base, "bg-orange-100/50 border-orange-200/60 hover:bg-orange-200");
    if (event.eventType === 'evento') return cn(base, "bg-yellow-100/50 border-yellow-200/60 hover:bg-yellow-200");

    // Eventos normais
    return cn(
      base,
      "border-[hsl(var(--category-color-hsl),0.4)]",
      "bg-[hsl(var(--category-color-hsl),0.15)]",
      "hover:bg-[var(--category-color)]"
    );
  };
  
  // Estilos para o container INTERNO (borda esquerda, conteúdo)
  const getInnerClasses = () => {
    const base = "flex items-start gap-2 border-l-4 px-3 py-2";
    
    if (event.eventType === 'feriado') return cn(base, "border-l-red-500");
    if (event.eventType === 'recesso') return cn(base, "border-l-orange-500");
    if (event.eventType === 'evento') return cn(base, "border-l-yellow-500");
    
    // Eventos normais
    return cn(base, "border-l-[var(--category-color)]");
  };
  
  // Estilos para o TÍTULO (muda de cor no hover)
  const getTitleClasses = () => {
    if (event.eventType !== 'normal') return "font-bold text-xs leading-tight text-foreground/90";
    
    return cn(
      "font-bold text-xs leading-tight",
      "text-[var(--category-color)]",
      "group-hover/card:text-[var(--category-text-color)]"
    );
  };

  // Estilos para a CATEGORIA (muda de cor no hover)
  const getCategoryLabelClasses = () => {
    const base = "text-xs opacity-75 leading-tight";
    
    if (event.eventType !== 'normal') return cn(base, "text-foreground/60");
    
    // Apenas para eventos normais
    return cn(base, "text-gray-600 group-hover/card:text-gray-200");
  };

  return (
    <div
      className={cn(getOuterClasses(), className)}
      style={cardStyle}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      <div className={getInnerClasses()}>
        {event.eventType === 'evento' && <Star className="w-3 h-3 mt-0.5 text-yellow-600 flex-shrink-0" />}
        <div className="flex flex-col gap-1 flex-grow">
          <div className={getTitleClasses()}>
            {event.title}
          </div>
          <div className={getCategoryLabelClasses()}>
            {safeCategoryInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
}
