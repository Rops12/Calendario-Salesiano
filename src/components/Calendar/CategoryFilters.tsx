import { eventCategories, EventCategory } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  selectedCategories: EventCategory[];
  onToggleCategory: (category: EventCategory) => void;
}

const getCategoryStyles = (category: EventCategory, isSelected: boolean) => {
  const baseStyles = "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-soft flex items-center gap-2 px-3 py-1.5 rounded-full font-medium border-2";
  
  const categoryMap = {
    geral: {
      selected: 'bg-category-geral text-white border-category-geral',
      unselected: 'border-category-geral text-category-geral hover:bg-category-geral hover:bg-opacity-10 bg-transparent'
    },
    infantil: {
      selected: 'bg-category-infantil text-white border-category-infantil',
      unselected: 'border-category-infantil text-category-infantil hover:bg-category-infantil hover:bg-opacity-10 bg-transparent'
    },
    fundamental1: {
      selected: 'bg-category-fundamental1 text-white border-category-fundamental1',
      unselected: 'border-category-fundamental1 text-category-fundamental1 hover:bg-category-fundamental1 hover:bg-opacity-10 bg-transparent'
    },
    fundamental2: {
      selected: 'bg-category-fundamental2 text-white border-category-fundamental2',
      unselected: 'border-category-fundamental2 text-category-fundamental2 hover:bg-category-fundamental2 hover:bg-opacity-10 bg-transparent'
    },
    medio: {
      selected: 'bg-category-medio text-white border-category-medio',
      unselected: 'border-category-medio text-category-medio hover:bg-category-medio hover:bg-opacity-10 bg-transparent'
    },
    pastoral: {
      selected: 'bg-category-pastoral text-white border-category-pastoral',
      unselected: 'border-category-pastoral text-category-pastoral hover:bg-category-pastoral hover:bg-opacity-10 bg-transparent'
    },
    esportes: {
      selected: 'bg-category-esportes text-white border-category-esportes',
      unselected: 'border-category-esportes text-category-esportes hover:bg-category-esportes hover:bg-opacity-10 bg-transparent'
    },
    robotica: {
      selected: 'bg-category-robotica text-white border-category-robotica',
      unselected: 'border-category-robotica text-category-robotica hover:bg-category-robotica hover:bg-opacity-10 bg-transparent'
    },
    biblioteca: {
      selected: 'bg-category-biblioteca text-white border-category-biblioteca',
      unselected: 'border-category-biblioteca text-category-biblioteca hover:bg-category-biblioteca hover:bg-opacity-10 bg-transparent'
    },
    nap: {
      selected: 'bg-category-nap text-white border-category-nap',
      unselected: 'border-category-nap text-category-nap hover:bg-category-nap hover:bg-opacity-10 bg-transparent'
    }
  };
  
  return cn(
    baseStyles, 
    isSelected ? categoryMap[category].selected : categoryMap[category].unselected
  );
};

export function CategoryFilters({ selectedCategories, onToggleCategory }: CategoryFiltersProps) {
  return (
    <div className="p-4 bg-card border-b shadow-soft">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">SEGMENTOS</h3>
        <div className="flex flex-wrap gap-2">
          {eventCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.value);
            
            return (
              <Badge
                key={category.value}
                variant="outline"
                className={getCategoryStyles(category.value, isSelected)}
                onClick={() => onToggleCategory(category.value)}
              >
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full",
                    `bg-${category.color}`,
                    isSelected && "bg-white"
                  )} 
                />
                <span className="text-sm font-medium">{category.label}</span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
