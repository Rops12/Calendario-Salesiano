// src/hooks/useCalendarEvents.ts
import { useState, useEffect } from 'react';
import { CalendarEvent, EventFormData } from '@/types/calendar';
import { ServiceContainer } from '@/services/ServiceContainer';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const eventService = ServiceContainer.getInstance().eventService;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const existingEvents = await eventService.getEvents();
        setEvents(existingEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]); // Em caso de erro, define como um array vazio
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [eventService]);

  const createEvent = async (data: EventFormData) => {
    try {
      const newEvent = await eventService.createEvent(data);
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, data: EventFormData) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, data);
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
