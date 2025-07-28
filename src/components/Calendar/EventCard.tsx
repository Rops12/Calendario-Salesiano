// src/components/Calendar/EventCard.tsx

import { cn } from "@/lib/utils";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarEvent } from "@/lib/calendarEvents";
import { Star } from "lucide-react";

// Função auxiliar para converter HEX para uma string RGB "R G B"
function hexToRgb(hex: string): string | null {
  // Expande o formato de 3 dígitos (ex: "03F") para 6 dígitos (ex: "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : null;
}

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  const { categories } = useCalendar();
  const categoryInfo = categories.find((c) => c.id === event.categoryId);

  const safeCategoryInfo = categoryInfo || {
    id: "default",
    label: "Sem categoria",
    color: "#A8A29E", // Cor principal (ex: stone-400)
    textColor: "#FAFAF9", // Cor do texto para contraste (ex: stone-50)
  };

  // Converte a cor principal para RGB para usarmos com transparência
  const rgbColor = hexToRgb(safeCategoryInfo.color);

  // Define as cores como variáveis CSS para serem usadas pelo Tailwind
  const cardStyle = {
    '--category-color-rgb': rgbColor,
    '--category-color': safeCategoryInfo.color,
    '--category-text-color': safeCategoryInfo.textColor,
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
      "bg-[rgba(var(--category-color-rgb),0.15)]", // Fundo claro (cor principal com 15% de opacidade)
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
