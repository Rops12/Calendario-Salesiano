import { CalendarEvent, EventFormData } from '@/types/calendar';

export interface IEventService {
  getEvents(): Promise<CalendarEvent[]>;
  createEvent(data: EventFormData): Promise<CalendarEvent>;
  updateEvent(id: string, data: EventFormData): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
  getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]>;
  getEventsByCategory(category: string): Promise<CalendarEvent[]>;
}

export interface IEventRepository {
  findAll(): Promise<CalendarEvent[]>;
  findById(id: string): Promise<CalendarEvent | null>;
  create(data: EventFormData): Promise<CalendarEvent>;
  update(id: string, data: EventFormData): Promise<CalendarEvent>;
  delete(id: string): Promise<void>;
  findByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]>;
  findByCategory(category: string): Promise<CalendarEvent[]>;
}