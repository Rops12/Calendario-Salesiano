// src/hooks/useCategories.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CategoryConfig } from '@/types/admin';
import { SupabaseAdminService } from '@/services/supabase/SupabaseAdminService';

interface CategoriesContextType {
  categories: CategoryConfig[];
  isLoading: boolean;
  getCategory: (value: string) => CategoryConfig | undefined;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const adminService = new SupabaseAdminService();

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const fetchedCategories = await adminService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategory = (value: string) => {
    return categories.find(cat => cat.value === value);
  };

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, getCategory }}>
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
