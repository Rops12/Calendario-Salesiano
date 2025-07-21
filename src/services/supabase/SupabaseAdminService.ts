import { supabase } from '@/integrations/supabase/client';
import { AdminUser, ActivityLog, CategoryConfig } from '@/types/admin';

export class SupabaseAdminService {
  // User Management
  async getUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin, role, created_at, updated_at');
    
    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      name: profile.email?.split('@')[0] || 'Usuário',
      email: profile.email || '',
      role: profile.role as 'admin' | 'editor' | 'viewer',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }));
  }

  async updateUser(id: string, userData: Partial<AdminUser>): Promise<void> {
    const updateData: any = {};
    
    if (userData.role) {
      updateData.role = userData.role;
      updateData.is_admin = userData.role === 'admin';
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  }

  async deleteUser(id: string): Promise<void> {
    // Deletar o perfil (o usuário auth será deletado via cascade)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Category Management
  async getCategories(): Promise<CategoryConfig[]> {
    const { data, error } = await supabase
      .from('event_categories')
      .select('value, label, color, is_active')
      .order('created_at');
    
    if (error) throw error;
    
    return data.map(cat => ({
      value: cat.value,
      label: cat.label,
      color: cat.color,
      isActive: cat.is_active
    }));
  }

  async addCategory(categoryData: Omit<CategoryConfig, 'isActive'>): Promise<void> {
    const { error } = await supabase
      .from('event_categories')
      .insert({
        value: categoryData.value,
        label: categoryData.label,
        color: categoryData.color,
        is_active: true
      });
    
    if (error) throw error;
  }

  async updateCategory(value: string, categoryData: Partial<CategoryConfig>): Promise<void> {
    const updateData: any = {};
    
    if (categoryData.label) updateData.label = categoryData.label;
    if (categoryData.color) updateData.color = categoryData.color;
    if (categoryData.isActive !== undefined) updateData.is_active = categoryData.isActive;
    
    const { error } = await supabase
      .from('event_categories')
      .update(updateData)
      .eq('value', value);
    
    if (error) throw error;
  }

  async deleteCategory(value: string): Promise<void> {
    const { error } = await supabase
      .from('event_categories')
      .delete()
      .eq('value', value);
    
    if (error) throw error;
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, user_id, user_name, action, target, target_id, description, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_name,
      action: log.action as any,
      target: log.target as any,
      targetId: log.target_id,
      description: log.description,
      timestamp: log.created_at
    }));
  }

  async addLog(logData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: logData.userId,
        user_name: logData.userName,
        action: logData.action,
        target: logData.target,
        target_id: logData.targetId,
        description: logData.description
      });
    
    if (error) throw error;
  }
}