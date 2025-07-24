// src/hooks/useAuth.ts
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { ServiceContainer } from '@/services/ServiceContainer';
import { User, LoginCredentials } from '@/services/interfaces/IAuthService';
import { supabase } from '@/integrations/supabase/client';

export type { User } from '@/services/interfaces/IAuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o Provedor de Autenticação (AuthProvider)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authService = ServiceContainer.getInstance().authService;

  useEffect(() => {
    // Listener para mudanças no estado de autenticação do Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        authService
          .getCurrentUser()
          .then(setUser)
          .catch(() => setUser(null))
          .finally(() => setIsLoading(false));
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Verifica a sessão inicial
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          authService
            .getCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
        } else {
          setIsLoading(false);
        }
      })
      .catch(async (error) => {
        // Handle invalid refresh token or other session errors
        console.warn('Session retrieval failed:', error);
        await authService.logout();
        setUser(null);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [authService]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
