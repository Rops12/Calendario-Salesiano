import { eventCategories, EventCategory } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  selectedCategories: EventCategory[];
  onToggleCategory: (category: EventCategory) => void;
}

const getCategoryStyles = (category: EventCategory, isSelected: boolean) => {
  const baseStyles = "cursor-pointer transition-all duration-200 hover:scale-105 flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border-0 shadow-sm";
  
  const categoryMap = {
    geral: {
      selected: 'bg-blue-500 text-white shadow-blue-200',
      unselected: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    infantil: {
      selected: 'bg-amber-500 text-white shadow-amber-200',
      unselected: 'bg-amber-50 text-amber-700 hover:bg-amber-100'
    },
    fundamental1: {
      selected: 'bg-green-500 text-white shadow-green-200',
      unselected: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    fundamental2: {
      selected: 'bg-cyan-500 text-white shadow-cyan-200',
      unselected: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
    },
    medio: {
      selected: 'bg-purple-500 text-white shadow-purple-200',
      unselected: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    pastoral: {
      selected: 'bg-pink-500 text-white shadow-pink-200',
      unselected: 'bg-pink-50 text-pink-600 hover:bg-pink-100'
    },
    esportes: {
      selected: 'bg-orange-500 text-white shadow-orange-200',
      unselected: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    },
    robotica: {
      selected: 'bg-indigo-500 text-white shadow-indigo-200',
      unselected: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
    },
    biblioteca: {
      selected: 'bg-emerald-500 text-white shadow-emerald-200',
      unselected: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
    },
    nap: {
      selected: 'bg-rose-500 text-white shadow-rose-200',
      unselected: 'bg-rose-50 text-rose-600 hover:bg-rose-100'
    }
  };
  
  return cn(
    baseStyles, 
    isSelected ? categoryMap[category].selected : categoryMap[category].unselected
  );
};

export function CategoryFilters({ selectedCategories, onToggleCategory }: CategoryFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Segmentos
          </h3>
        </div>
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
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isSelected ? "bg-white" : {
                    'bg-blue-500': category.value === 'geral',
                    'bg-yellow-500': category.value === 'infantil',
                    'bg-green-500': category.value === 'fundamental1',
                    'bg-cyan-500': category.value === 'fundamental2',
                    'bg-purple-500': category.value === 'medio',
                    'bg-pink-500': category.value === 'pastoral',
                    'bg-orange-500': category.value === 'esportes',
                    'bg-indigo-500': category.value === 'robotica',
                    'bg-emerald-500': category.value === 'biblioteca',
                    'bg-rose-500': category.value === 'nap'
                  }
                )} />
                <span className="font-medium">{category.label}</span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}