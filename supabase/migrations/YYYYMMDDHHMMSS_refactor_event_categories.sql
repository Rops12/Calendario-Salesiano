-- supabase/migrations/YYYYMMDDHHMMSS_refactor_event_categories.sql

-- Remover o ENUM event_category se ele existir.
-- A remoção de ENUMs pode ser complexa se estiverem em uso.
-- Esta abordagem altera a coluna para TEXT e depois remove o tipo.
ALTER TABLE public.events
ALTER COLUMN category TYPE TEXT;

DROP TYPE IF EXISTS public.event_category;

-- Adicionar a restrição de chave estrangeira na tabela de eventos
-- para garantir a integridade referencial com as categorias.
ALTER TABLE public.events
ADD CONSTRAINT events_category_fkey FOREIGN KEY (category) REFERENCES public.event_categories (value) ON DELETE SET NULL ON UPDATE CASCADE;

-- Adicionar um índice na coluna de categoria para melhorar a performance das consultas.
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- Adicionar a coluna 'name' à tabela 'profiles' se ainda não existir.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Atualizar e simplificar a função `handle_new_user`.
-- Esta função agora será a única fonte da verdade para a criação de perfis,
-- extraindo o nome do e-mail e definindo o primeiro usuário como 'admin'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, is_admin, role)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1), -- Usa a parte local do e-mail como nome padrão
    NEW.email,
    -- O primeiro usuário cadastrado será sempre o administrador
    (SELECT COUNT(*) FROM public.profiles) = 0,
    -- Define o papel: 'admin' para o primeiro usuário, 'editor' para os demais
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin' ELSE 'editor' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
