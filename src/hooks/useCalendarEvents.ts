import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Event, CreateEventDTO, UpdateEventDTO } from '@/entities/Event';
import { services } from '@/services/ServiceContainer';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedEvents = await services.event.getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast({
        title: 'Erro ao carregar eventos',
        description: 'Não foi possível buscar os eventos. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (eventData: CreateEventDTO) => {
    try {
      const newEvent = await services.event.create(eventData);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      toast({
        title: 'Sucesso!',
        description: 'Evento criado com sucesso.',
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: 'Erro ao criar evento',
        description: 'Não foi possível salvar o novo evento.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updateEvent = useCallback(async (id: number, eventData: UpdateEventDTO) => {
    try {
      const updatedEvent = await services.event.update(id, eventData);
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === id ? updatedEvent : event))
      );
      toast({
        title: 'Sucesso!',
        description: 'Evento atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      toast({
        title: 'Erro ao atualizar evento',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteEvent = useCallback(async (id: number) => {
    try {
      await services.event.delete(id);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      toast({
        title: 'Sucesso!',
        description: 'Evento excluído com sucesso.',
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast({
        title: 'Erro ao excluir evento',
        description: 'Não foi possível excluir o evento.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    events,
    isLoading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};