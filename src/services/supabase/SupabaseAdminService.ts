import { supabase } from '@/integrations/supabase/client';
import { AdminUser, ActivityLog, CategoryConfig } from '@/types/admin';

export class SupabaseAdminService {
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
    // Primeiro, criar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: 'temp123456', // Senha temporária
      email_confirm: true
    });

    if (authError) throw new Error(`Erro ao criar usuário: ${authError.message}`);
    if (!authData.user) throw new Error('Falha ao criar usuário');

    // Depois, atualizar o perfil com os dados corretos
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        email: userData.email,
        role: userData.role,
        is_admin: userData.role === 'admin'
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) {
      // Se falhar ao atualizar o perfil, tentar deletar o usuário criado
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    return {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at
    };
  }

  async updateUser(id: string, userData: Partial<AdminUser>): Promise<void> {
    const updateData: any = {};
    
    if (userData.email) updateData.email = userData.email;
    if (userData.role) {
      updateData.role = userData.role;
      updateData.is_admin = userData.role === 'admin';
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;

    // Se o email foi alterado, também atualizar no auth
    if (userData.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email: userData.email
      });
      
      if (authError) {
        console.warn('Erro ao atualizar email no auth:', authError);
      }
    }
  }

  async deleteUser(id: string): Promise<void> {
    // Primeiro deletar o usuário do auth (isso também deletará o perfil via cascade)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) throw new Error(`Erro ao deletar usuário: ${authError.message}`);
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw new Error(`Erro ao enviar email de redefinição: ${error.message}`);
  }
}