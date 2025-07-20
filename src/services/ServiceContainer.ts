import { IEventService } from './interfaces/IEventService';
import { IAuthService } from './interfaces/IAuthService';
import { SupabaseEventService } from './supabase/SupabaseEventService';
import { SupabaseAuthService } from './supabase/SupabaseAuthService';

// This container will be easily replaced with Supabase implementations
export class ServiceContainer {
  private static instance: ServiceContainer;
  
  private _eventService: IEventService;
  private _authService: IAuthService;

  private constructor() {
    // Using Supabase implementations
    this._eventService = new SupabaseEventService();
    this._authService = new SupabaseAuthService();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  get eventService(): IEventService {
    return this._eventService;
  }

  get authService(): IAuthService {
    return this._authService;
  }

  // Method to replace services (useful for Supabase migration)
  replaceEventService(service: IEventService): void {
    this._eventService = service;
  }

  replaceAuthService(service: IAuthService): void {
    this._authService = service;
  }
}