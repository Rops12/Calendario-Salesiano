import { IEventService } from './interfaces/IEventService';
import { IAuthService } from './interfaces/IAuthService';
import { SupabaseEventService } from './supabase/SupabaseEventService';
import { SupabaseAuthService } from './supabase/SupabaseAuthService';
import { ICategoryService } from './interfaces/ICategoryService';
import { SupabaseCategoryService } from './supabase/SupabaseCategoryService';

// O Service Container gerencia qual implementação de serviço será usada.
export class ServiceContainer {
  private static instance: ServiceContainer;

  // Propriedades privadas para cada serviço
  private _eventService: IEventService;
  private _authService: IAuthService;
  private _categoryService: ICategoryService;

  private constructor() {
    // Aqui instanciamos as implementações concretas (Supabase)
    this._eventService = new SupabaseEventService();
    this._authService = new SupabaseAuthService();
    this._categoryService = new SupabaseCategoryService();
  }

  // Padrão Singleton para garantir uma única instância de serviços
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // Getters públicos para acessar os serviços
  public get event(): IEventService {
    return this._eventService;
  }

  public get auth(): IAuthService {
    return this._authService;
  }

  public get category(): ICategoryService {
    return this._categoryService;
  }
}

// CORREÇÃO: Exporta a instância única para ser usada em toda a aplicação
export const services = ServiceContainer.getInstance();