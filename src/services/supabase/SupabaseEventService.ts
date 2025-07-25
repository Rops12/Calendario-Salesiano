import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, EventFormData } from '@/types/calendar';
import { IEventService } from '../interfaces/IEventService';
import { useAuth } from '@/hooks/useAuth';

export class SupabaseEventService implements IEventService {
  private async sendEventNotification(
    eventId: string,
    eventData: EventFormData | CalendarEvent,
    action: 'created' | 'updated' | 'deleted'
  ) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', session.user.id)
        .single();

      const userName = profile?.email?.split('@')[0] || 'Usuário';
      const userEmail = profile?.email || session.user.email || '';

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-event-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventTitle: eventData.title,
          eventDescription: eventData.description,
          eventDate: eventData.startDate,
          eventCategory: eventData.category,
          action,
          userEmail,
          userName
        }),
      });

      if (!response.ok) {
        console.error('Failed to send event notification:', await response.text());
      } else {
        const result = await response.json();
        console.log(`Event notification sent to ${result.emailsSent} users`);
      }
    } catch (error) {
      console.error('Error sending event notification:', error);
    }
  }

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

    const newEvent = this.mapDatabaseToEvent(data);
    
    // Send notification email
    await this.sendEventNotification(newEvent.id, eventData, 'created');
    
    return newEvent;
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

    const updatedEvent = this.mapDatabaseToEvent(data);
    
    // Send notification email
    await this.sendEventNotification(id, eventData, 'updated');
    
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    // Get event data before deletion for notification
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw new Error('Erro ao excluir evento');
    }

    // Send notification email if event was found
    if (eventData) {
      const mappedEvent = this.mapDatabaseToEvent(eventData);
      await this.sendEventNotification(id, mappedEvent, 'deleted');
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