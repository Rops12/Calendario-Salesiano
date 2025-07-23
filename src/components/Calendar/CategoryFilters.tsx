// src/components/Calendar/CategoryFilters.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFiltersProps {
  selectedCategories: string[];
  onToggleCategory: (categoryValue: string) => void;
}

export function CategoryFilters({ selectedCategories, onToggleCategory }: CategoryFiltersProps) {
  const { categories, isLoading } = useCategories();
  
  // Mostra apenas categorias ativas no filtro
  const activeCategories = categories.filter(cat => cat.isActive);

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Segmentos
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)
          ) : (
            activeCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.value);
              
              return (
                <Badge
                  key={category.value}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105 flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm border-2",
                    isSelected
                      ? `text-white border-transparent`
                      : `bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200`
                  )}
                  style={{ backgroundColor: isSelected ? category.color : undefined }}
                  onClick={() => onToggleCategory(category.value)}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                  <span className="font-semibold">{category.label}</span>
                </Badge>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
