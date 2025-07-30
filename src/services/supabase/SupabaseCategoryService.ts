import { supabase } from '@/integrations/supabase/client';
import { ICategoryService } from '../interfaces/ICategoryService';
import { Category } from '@/entities/Category';

export class SupabaseCategoryService implements ICategoryService {
  private mapToCategory(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      // Se a sua tabela usa 'label' e 'value', ajuste aqui.
      // Assumindo que 'name' é o identificador único.
    };
  }

  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase.from('event_categories').select('*');
    if (error) throw error;
    // O Supabase já deve retornar os dados no formato correto (label, value, color)
    return data;
  }

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase
      .from('event_categories')
      .insert(categoryData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('event_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('event_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}