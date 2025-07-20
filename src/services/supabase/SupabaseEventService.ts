import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, EventFormData } from '@/types/calendar';
import { IEventService } from '../interfaces/IEventService';

export class SupabaseEventService implements IEventService {
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events by date range:', error);
      throw new Error('Erro ao carregar eventos por data');
    }

    return (data || []).map(this.mapDatabaseToEvent);
  }

  async getEventsByCategory(category: any): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('category', category)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events by category:', error);
      throw new Error('Erro ao carregar eventos por categoria');
    }

    return (data || []).map(this.mapDatabaseToEvent);
  }
  async getEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      throw new Error('Erro ao carregar eventos');
    }

    return (data || []).map(this.mapDatabaseToEvent);
  }

  async createEvent(eventData: EventFormData): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description || null,
        start_date: eventData.startDate,
        end_date: eventData.endDate || null,
        category: eventData.category,
        event_type: eventData.eventType
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw new Error('Erro ao criar evento');
    }

    return this.mapDatabaseToEvent(data);
  }

  async updateEvent(id: string, eventData: EventFormData): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description || null,
        start_date: eventData.startDate,
        end_date: eventData.endDate || null,
        category: eventData.category,
        event_type: eventData.eventType,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Erro ao atualizar evento');
    }

    return this.mapDatabaseToEvent(data);
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw new Error('Erro ao excluir evento');
    }
  }

  private mapDatabaseToEvent(dbEvent: any): CalendarEvent {
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      date: dbEvent.start_date, // Para compatibilidade
      startDate: dbEvent.start_date,
      endDate: dbEvent.end_date,
      category: dbEvent.category,
      eventType: dbEvent.event_type,
      isHoliday: dbEvent.event_type === 'feriado',
      createdAt: dbEvent.created_at,
      updatedAt: dbEvent.updated_at
    };
  }
}