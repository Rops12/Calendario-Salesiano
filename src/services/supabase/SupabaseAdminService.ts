import { supabase } from '@/integrations/supabase/client';
import { AdminUser, ActivityLog, CategoryConfig } from '@/types/admin';

export class SupabaseAdminService {
  private async callAdminFunction(action: string, data: any) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erro na operação');
    }
    
    return result;
  }

  // User Management
  async getUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      name: profile.email?.split('@')[0] || 'Usuário',
      email: profile.email || '',
      role: (profile.role as 'admin' | 'editor' | 'viewer') || 'viewer',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }));
  }

  async addUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const result = await this.callAdminFunction('create', userData);
    return result.user;
  }

  async updateUser(id: string, userData: Partial<AdminUser>): Promise<void> {
    await this.callAdminFunction('update', { id, ...userData });
  }

  async deleteUser(id: string): Promise<void> {
    await this.callAdminFunction('delete', { id });
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

  async sendPasswordResetEmail(email: string): Promise<void> {
    await this.callAdminFunction('reset-password', { email });
  }
}