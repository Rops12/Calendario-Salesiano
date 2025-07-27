-- Adicionar índice para otimização de performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Criar tabela para logs de atividade
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  target_id TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para logs - apenas admins podem ver
CREATE POLICY "Apenas admins podem ver logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Política para logs - apenas admins podem criar
CREATE POLICY "Apenas admins podem criar logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Criar tabela para categorias personalizadas
CREATE TABLE public.event_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de categorias
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias - todos podem ver
CREATE POLICY "Todos podem ver categorias" 
ON public.event_categories 
FOR SELECT 
USING (true);

-- Política para categorias - apenas admins podem modificar
CREATE POLICY "Apenas admins podem criar categorias" 
ON public.event_categories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem atualizar categorias" 
ON public.event_categories 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem deletar categorias" 
ON public.event_categories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Trigger para atualizar updated_at nas categorias
CREATE TRIGGER update_event_categories_updated_at
  BEFORE UPDATE ON public.event_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna de papel (role) na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor'));

-- Atualizar função handle_new_user para incluir role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin, role)
  VALUES (
    NEW.id, 
    NEW.email,
    -- Primeiro usuário será admin
    NOT EXISTS (SELECT 1 FROM public.profiles),
    -- Se for admin, role é admin, senão editor
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin' ELSE 'editor' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir categorias padrão
INSERT INTO public.event_categories (value, label, color) VALUES
  ('geral', 'Geral', 'hsl(215, 100%, 50%)'),
  ('infantil', 'Ensino Infantil', 'hsl(142, 76%, 36%)'),
  ('fundamental1', 'Fundamental I', 'hsl(45, 93%, 47%)'),
  ('fundamental2', 'Fundamental II', 'hsl(25, 95%, 53%)'),
  ('medio', 'Ensino Médio', 'hsl(262, 83%, 58%)'),
  ('pastoral', 'Pastoral', 'hsl(330, 81%, 60%)'),
  ('esportes', 'Esportes', 'hsl(0, 84%, 60%)'),
  ('robotica', 'Robótica', 'hsl(188, 94%, 42%)'),
  ('biblioteca', 'Biblioteca', 'hsl(20, 14%, 46%)'),
  ('nap', 'NAP', 'hsl(215, 16%, 47%)')
ON CONFLICT (value) DO NOTHING;
