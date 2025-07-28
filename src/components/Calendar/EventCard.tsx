// src/components/Calendar/EventCard.tsx

import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories"; // CORRIGIDO
import { CalendarEvent } from "@/types/calendar"; // CORRIGIDO
import { Star } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  const { getCategory } = useCategories(); // CORRIGIDO: Usando o hook correto
  const categoryInfo = getCategory(event.category); // CORRIGIDO: Buscando a categoria pelo valor

  const safeCategoryInfo = categoryInfo || {
    value: "default",
    label: "Sem categoria",
    color: "hsl(220, 13%, 69%)", // Cor cinza (stone-400) como fallback
    isActive: true,
  };
  
  // Extrai os valores numéricos do HSL para usar com transparência
  const hslColorValue = safeCategoryInfo.color.match(/\d+/g)?.join(" ") || "220 13% 69%";

  // Define as variáveis CSS para serem usadas pelo Tailwind
  const cardStyle = {
    '--category-color-hsl': hslColorValue,
    '--category-color': `hsl(${hslColorValue})`,
    '--category-text-color': '#FFFFFF', // Texto de contraste (branco)
  } as React.CSSProperties;

  const getEventCardClasses = () => {
    const baseStyles = "group px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 break-words whitespace-normal leading-tight cursor-pointer border-l-4 flex items-start gap-2";

    // Estilos para eventos especiais (feriados, recessos, etc.)
    if (event.eventType === 'feriado') return cn(baseStyles, "bg-red-100 text-red-900 border-l-red-500 font-semibold hover:bg-red-200");
    if (event.eventType === 'recesso') return cn(baseStyles, "bg-orange-100 text-orange-900 border-l-orange-500 font-semibold hover:bg-orange-200");
    if (event.eventType === 'evento') return cn(baseStyles, "bg-yellow-100 text-yellow-900 border-l-yellow-500 font-semibold hover:bg-yellow-200");

    // Estilo unificado para eventos NORMAIS
    return cn(
      baseStyles,
      "border-[var(--category-color)]", // Borda com a cor principal
      "bg-[hsl(var(--category-color-hsl),0.15)]", // Fundo claro (cor com 15% de opacidade)
      "hover:bg-[var(--category-color)]" // No hover, fundo com a cor principal sólida
    );
  };
  
  const getTitleClasses = () => {
    // Para eventos especiais, o texto não muda de cor
    if (event.eventType !== 'normal') {
      return "font-bold text-xs leading-tight";
    }
    
    // Para eventos normais, o texto muda de cor no hover
    return cn(
      "font-bold text-xs leading-tight",
      "text-[var(--category-color)]", // Cor do texto é a cor principal da categoria
      "group-hover:text-[var(--category-text-color)]" // No hover, usa a cor de texto de contraste
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
        <div className="text-xs opacity-75 leading-tight text-gray-600 group-hover:text-gray-200">
          {safeCategoryInfo.label}
        </div>
      </div>
    </div>
  );
}
