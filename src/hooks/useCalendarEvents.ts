import { useState, useEffect } from 'react';
import { CalendarEvent, EventFormData } from '@/types/calendar';
import { ServiceContainer } from '@/services/ServiceContainer';

// Mock data for demonstration - will be migrated to database
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Feriado - Ano Novo',
    description: 'Feriado Nacional',
    date: '2024-01-01',
    startDate: '2024-01-01',
    category: 'geral',
    eventType: 'feriado',
    isHoliday: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Reunião Pedagógica',
    description: 'Reunião mensal do corpo docente',
    date: '2024-01-03',
    startDate: '2024-01-03',
    category: 'geral',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Adaptação Infantil',
    description: 'Período de adaptação para novos alunos',
    date: '2024-01-05',
    startDate: '2024-01-05',
    category: 'infantil',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Início Fund. I',
    description: 'Início das aulas do Ensino Fundamental I',
    date: '2024-01-08',
    startDate: '2024-01-08',
    category: 'fundamental1',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    title: 'Início Fund. II',
    description: 'Início das aulas do Ensino Fundamental II',
    date: '2024-01-10',
    startDate: '2024-01-10',
    category: 'fundamental2',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    title: 'Início Ens. Médio',
    description: 'Início das aulas do Ensino Médio',
    date: '2024-01-12',
    startDate: '2024-01-12',
    category: 'medio',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    title: 'Missa Abertura',
    description: 'Missa de abertura do ano letivo',
    date: '2024-01-15',
    startDate: '2024-01-15',
    category: 'pastoral',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    title: 'Torneio Esportivo',
    description: 'Torneio interescolar de futebol',
    date: '2024-01-20',
    startDate: '2024-01-20',
    category: 'esportes',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    title: 'Workshop Robótica',
    description: 'Workshop de programação e robótica',
    date: '2024-01-22',
    startDate: '2024-01-22',
    category: 'robotica',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    title: 'Feira do Livro',
    description: 'Feira anual de livros da biblioteca',
    date: '2024-01-26',
    startDate: '2024-01-26',
    category: 'biblioteca',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '11',
    title: 'Atendimento NAP',
    description: 'Atendimento psicopedagógico especializado',
    date: '2024-01-29',
    startDate: '2024-01-29',
    category: 'nap',
    eventType: 'evento',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '12',
    title: 'Recesso de Carnaval',
    description: 'Recesso escolar para o período de carnaval',
    date: '2024-02-12',
    startDate: '2024-02-12',
    endDate: '2024-02-14',
    category: 'geral',
    eventType: 'recesso',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const eventService = ServiceContainer.getInstance().eventService;

  // Initialize with mock data on first load, then use service
  useEffect(() => {
    const initializeEvents = async () => {
      try {
        setIsLoading(true);
        const existingEvents = await eventService.getEvents();
        
        // If no events exist, populate with mock data
        if (existingEvents.length === 0) {
          for (const mockEvent of mockEvents) {
            await eventService.createEvent({
              title: mockEvent.title,
              description: mockEvent.description,
              startDate: mockEvent.startDate,
              endDate: mockEvent.endDate,
              category: mockEvent.category,
              eventType: mockEvent.eventType
            });
          }
          const loadedEvents = await eventService.getEvents();
          setEvents(loadedEvents);
        } else {
          setEvents(existingEvents);
        }
      } catch (error) {
        console.error('Error initializing events:', error);
        setEvents(mockEvents); // Fallback to mock data
      } finally {
        setIsLoading(false);
      }
    };

    initializeEvents();
  }, [eventService]);

  const createEvent = async (data: EventFormData) => {
    try {
      const newEvent = await eventService.createEvent(data);
      setEvents(prev => [...prev, newEvent]);
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

  // Function to get events that span multiple days or are on specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      
      return dateStr >= eventStartDate && dateStr <= eventEndDate;
    });
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate
  };
}