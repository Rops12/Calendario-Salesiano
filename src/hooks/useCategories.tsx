// src/hooks/useCategories.tsx
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { CategoryConfig } from '@/types/admin';
import { SupabaseAdminService } from '@/services/supabase/SupabaseAdminService';

interface CategoriesContextType {
  categories: CategoryConfig[];
  isLoading: boolean;
  getCategory: (value: string) => CategoryConfig | undefined;
  refetchCategories: () => Promise<void>; // Função para recarregar
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);
const adminService = new SupabaseAdminService();

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Usamos useCallback para evitar recriações desnecessárias da função
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await adminService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]); // Garante que o estado não fique inconsistente em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategory = (value: string) => {
    return categories.find(cat => cat.value === value);
  };

  const value = {
    categories,
    isLoading,
    getCategory,
    refetchCategories: fetchCategories, // Expondo a função de recarregamento
  };

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
