import { CalendarEvent, EventFormData } from '@/types/calendar';
import { IEventService } from '@/services/interfaces/IEventService';

const EVENTS_STORAGE_KEY = 'calendar-events';

export class LocalStorageEventService implements IEventService {
  private getEventsFromStorage(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading events from localStorage:', error);
      return [];
    }
  }

  private saveEventsToStorage(events: CalendarEvent[]): void {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }

  async getEvents(): Promise<CalendarEvent[]> {
    return this.getEventsFromStorage();
  }

  async createEvent(data: EventFormData): Promise<CalendarEvent> {
    const events = this.getEventsFromStorage();
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      ...data,
      date: data.startDate, // Backward compatibility
      isHoliday: data.eventType === 'feriado', // Backward compatibility
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    events.push(newEvent);
    this.saveEventsToStorage(events);
    return newEvent;
  }

  async updateEvent(id: string, data: EventFormData): Promise<CalendarEvent> {
    const events = this.getEventsFromStorage();
    const index = events.findIndex(event => event.id === id);
    
    if (index === -1) {
      throw new Error('Event not found');
    }

    const updatedEvent: CalendarEvent = {
      ...events[index],
      ...data,
      date: data.startDate, // Backward compatibility
      isHoliday: data.eventType === 'feriado', // Backward compatibility
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    this.saveEventsToStorage(events);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = this.getEventsFromStorage();
    const filteredEvents = events.filter(event => event.id !== id);
    this.saveEventsToStorage(filteredEvents);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const events = this.getEventsFromStorage();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  async getEventsByCategory(category: string): Promise<CalendarEvent[]> {
    const events = this.getEventsFromStorage();
    return events.filter(event => event.category === category);
  }
}