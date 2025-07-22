import { eventCategories, EventCategory } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CategoryFiltersProps {
  selectedCategories: EventCategory[];
  onToggleCategory: (category: EventCategory) => void;
}

export function CategoryFilters({ selectedCategories, onToggleCategory }: CategoryFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Segmentos
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {eventCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.value);
            const { background, foreground, border, hoverBackground } = category.tw;

            return (
              <Badge
                key={category.value}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm border-2",
                  isSelected 
                    ? `bg-opacity-100 ${background} ${foreground} ${border}`
                    : `bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200`
                )}
                onClick={() => onToggleCategory(category.value)}
              >
                {isSelected && <Check className="w-4 h-4" />}
                <span className="font-semibold">{category.label}</span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
