-- Adicionar a coluna 'name' à tabela 'profiles'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Atualizar a função handle_new_user para inserir o email como um nome padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, is_admin, role)
  VALUES (
    NEW.id,
    NEW.email, -- Usa o email como nome padrão inicial
    NEW.email,
    -- Primeiro usuário será admin
    NOT EXISTS (SELECT 1 FROM public.profiles),
    -- Se for admin, role é admin, senão viewer
    CASE WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin' ELSE 'viewer' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
