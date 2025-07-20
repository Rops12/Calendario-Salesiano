# Guia de Migração para Supabase

Este documento orienta como migrar o sistema atual (localStorage) para Supabase.

## Arquitetura Atual

O sistema está estruturado com interfaces de serviços que permitem troca fácil de implementações:

### Interfaces Principais
- `IEventService` - Gerenciamento de eventos
- `IAuthService` - Autenticação de usuários

### Implementações Atuais
- `LocalStorageEventService` - Eventos salvos no localStorage
- `LocalStorageAuthService` - Autenticação mock com localStorage

## Passos para Migração ao Supabase

### 1. Configurar Supabase
```bash
# Instalar dependências
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Criar Tabelas no Supabase

#### Tabela de Eventos
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  category VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Events are insertable by authenticated users" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Events are updatable by authenticated users" ON events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Events are deletable by authenticated users" ON events
  FOR DELETE USING (auth.role() = 'authenticated');
```

#### Tabela de Usuários (se necessário estender auth.users)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 3. Criar Implementações Supabase

#### SupabaseEventService
```typescript
// src/services/supabase/SupabaseEventService.ts
import { createClient } from '@supabase/supabase-js';
import { IEventService } from '../interfaces/IEventService';

export class SupabaseEventService implements IEventService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  async getEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .order('start_date');
    
    if (error) throw error;
    return data.map(this.mapFromDatabase);
  }

  // ... implement other methods
}
```

#### SupabaseAuthService
```typescript
// src/services/supabase/SupabaseAuthService.ts
import { createClient } from '@supabase/supabase-js';
import { IAuthService } from '../interfaces/IAuthService';

export class SupabaseAuthService implements IAuthService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    
    // Get user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.email!,
      role: profile?.role || 'teacher'
    };
  }

  // ... implement other methods
}
```

### 4. Atualizar ServiceContainer

```typescript
// src/services/ServiceContainer.ts
import { SupabaseEventService } from './supabase/SupabaseEventService';
import { SupabaseAuthService } from './supabase/SupabaseAuthService';

// Para migração, substitua as implementações:
export class ServiceContainer {
  private constructor() {
    // Trocar para Supabase quando estiver pronto
    this._eventService = new SupabaseEventService();
    this._authService = new SupabaseAuthService();
  }
}
```

## Benefícios da Arquitetura Atual

1. **Fácil Migração**: Apenas trocar implementações no ServiceContainer
2. **Testabilidade**: Cada serviço pode ser testado independentemente  
3. **Manutenibilidade**: Código organizado em camadas bem definidas
4. **Flexibilidade**: Pode usar diferentes providers (Supabase, Firebase, etc.)

## Dados para Migração

Os dados mock atuais estão em `useCalendarEvents.ts` e podem ser facilmente importados para o Supabase via script ou interface admin.

## Funcionalidades Prontas para Supabase

- ✅ Autenticação com roles
- ✅ CRUD completo de eventos  
- ✅ Filtros por categoria e data
- ✅ Busca em tempo real
- ✅ Exportação PDF
- ✅ Interface administrativa

A migração será transparente para os usuários finais!