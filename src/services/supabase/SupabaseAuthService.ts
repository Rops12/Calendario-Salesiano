import { supabase } from '@/integrations/supabase/client';
import { IAuthService, User, LoginCredentials } from '../interfaces/IAuthService';

export class SupabaseAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email || '',
      isAdmin: profile?.is_admin || false,
      role: profile?.role as 'admin' | 'editor' | undefined
    };
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error('Credenciais inválidas');
    }

    if (!data.user) {
      throw new Error('Erro no login');
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Se não encontrar perfil, criar um
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          is_admin: false,
          role: 'editor' // Novo padrão
        })
        .select()
        .single();
      
      return {
        id: data.user.id,
        email: data.user.email || '',
        isAdmin: newProfile?.is_admin || false,
        role: newProfile?.role as 'admin' | 'editor' | undefined
      };
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      isAdmin: profile?.is_admin || false,
      role: profile?.role as 'admin' | 'editor' | undefined
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw new Error('Erro ao fazer logout');
    }
  }

  async signUp(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      console.error('SignUp error:', error);
      throw new Error('Erro ao criar conta');
    }

    if (!data.user) {
      throw new Error('Erro ao criar usuário');
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      isAdmin: false,
      role: 'editor'
    };
  }
}
