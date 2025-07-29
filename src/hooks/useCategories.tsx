import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { services } from '@/services/ServiceContainer';
import { useToast } from '@/components/ui/use-toast';
import { Category } from '@/entities/Category';

interface CategoriesContextType {
  categories: { value: string; label: string }[];
  selectedCategories: string[];
  handleCategoryChange: (categoryValue: string) => void;
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await services.category.getAll();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast({
        title: 'Erro ao carregar categorias',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryChange = useCallback((categoryValue: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryValue);
      if (isSelected) {
        return prev.filter((c) => c !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  }, []);

  const formattedCategories = useMemo(() => {
    return categories.map((cat) => ({ value: cat.name, label: cat.name }));
  }, [categories]);

  const value = useMemo(
    () => ({
      categories: formattedCategories,
      selectedCategories,
      handleCategoryChange,
      isLoading,
      fetchCategories,
    }),
    [
      formattedCategories,
      selectedCategories,
      handleCategoryChange,
      isLoading,
      fetchCategories,
    ]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};