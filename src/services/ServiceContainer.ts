import { IEventService } from './interfaces/IEventService';
import { IAuthService } from './interfaces/IAuthService';
import { LocalStorageEventService } from './localStorage/LocalStorageEventService';
import { LocalStorageAuthService } from './localStorage/LocalStorageAuthService';

// This container will be easily replaced with Supabase implementations
export class ServiceContainer {
  private static instance: ServiceContainer;
  
  private _eventService: IEventService;
  private _authService: IAuthService;

  private constructor() {
    // Currently using localStorage implementations
    // Will be easily replaced with Supabase implementations
    this._eventService = new LocalStorageEventService();
    this._authService = new LocalStorageAuthService();
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