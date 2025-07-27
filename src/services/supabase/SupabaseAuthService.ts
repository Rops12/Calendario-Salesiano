// src/services/supabase/SupabaseAuthService.ts
import { supabase } from '@/integrations/supabase/client';
import { IAuthService, User, LoginCredentials } from '../interfaces/IAuthService';

export class SupabaseAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, is_admin, role, name') // Adicionado 'name'
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      // Se o perfil não existir por algum motivo, desloga o usuário para evitar estado inconsistente.
      await this.logout();
      return null;
    }

    return {
      id: profile.id,
      email: profile.email || '',
      name: profile.name || profile.email?.split('@')[0] || 'Usuário', // Adicionado 'name'
      isAdmin: profile.is_admin || false,
      role: profile.role as 'admin' | 'editor' | undefined
    };
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error || !data.user) {
      console.error('Login error:', error);
      throw new Error('Credenciais inválidas.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_admin, role, name') // Adicionado 'name'
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error after login:', profileError);
      // Força o logout se o perfil não for encontrado, pois o gatilho deveria tê-lo criado.
      await this.logout();
      throw new Error('Erro ao buscar perfil do usuário. Tente novamente.');
    }

    return {
      id: profile.id,
      email: profile.email || '',
      name: profile.name || profile.email?.split('@')[0] || 'Usuário', // Adicionado 'name'
      isAdmin: profile.is_admin || false,
      role: profile.role as 'admin' | 'editor' | undefined
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw new Error('Erro ao fazer logout');
    }
  }
}
