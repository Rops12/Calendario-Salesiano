import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/Auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Calendário Salesiano.",
      });
      navigate('/', { replace: true });
    } catch (error) {
      throw error; // Repassa o erro para o componente LoginForm
    }
  };

  if (isAuthenticated) {
    return null; // Evita flash da tela de login
  }

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
}