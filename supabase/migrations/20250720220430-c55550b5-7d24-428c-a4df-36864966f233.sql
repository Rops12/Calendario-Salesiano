-- Criar enum para categorias de eventos
CREATE TYPE public.event_category AS ENUM (
  'geral',
  'infantil', 
  'fundamental1',
  'fundamental2',
  'medio',
  'pastoral',
  'esportes',
  'robotica',
  'biblioteca',
  'nap'
);

-- Criar enum para tipos de eventos  
CREATE TYPE public.event_type AS ENUM (
  'normal',
  'evento',
  'feriado',
  'recesso'
);

-- Criar tabela de eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  category event_category NOT NULL DEFAULT 'geral',
  event_type event_type NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos (público para leitura, admin para escrita)
CREATE POLICY "Todos podem ver eventos" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem criar eventos" 
ON public.events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem atualizar eventos" 
ON public.events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem deletar eventos" 
ON public.events 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Políticas para perfis
CREATE POLICY "Usuários podem ver próprio perfil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id, 
    NEW.email,
    -- Primeiro usuário será admin
    NOT EXISTS (SELECT 1 FROM public.profiles)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();