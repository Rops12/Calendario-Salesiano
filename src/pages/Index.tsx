import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/Calendar';
import { EventModal } from '@/components/Calendar/EventModal';
import { DayEventModal } from '@/components/Calendar/DayEventModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import { CalendarEvent } from '@/types/calendar';
import { format, startOfMonth } from 'date-fns';
import { CategoryConfig } from '@/types/admin';
import { useCategories } from '@/hooks/useCategories';
import { Header } from '@/components/Header';
import { useToast } from '@/components/ui/use-toast';

// Hierarquia de prioridade das categorias
const categoryOrder: { [key: string]: number } = {
  'geral': 1,
  'feriado': 2,
  'recesso': 3,
  'evento': 4,
  'infantil': 10,
  'fundamental1': 11,
  'fundamental2': 12,
  'medio': 13,
  'pastoral': 20,
  'esportes': 21,
  'biblioteca': 22,
  'robotica': 23,
  'nap': 24,
};

// Função auxiliar para obter a ordem da categoria
const getCategoryOrder = (category: string) => categoryOrder[category] || 99;

export default function Index() {
  const { user, canEdit, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  
  const { 
    events, 
    loading: eventsLoading, 
    addEvent: addEventHandler, 
    updateEvent: updateEventHandler, 
    deleteEvent: deleteEventHandler 
  } = useCalendarEvents(currentMonth);
  
  const { categories, loading: categoriesLoading } = useCategories();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  const handleEventOperation = async (operation: Promise<any>, successMessage: string, errorMessage: string) => {
    try {
      await operation;
      toast({
        title: "Sucesso!",
        description: successMessage,
      });
    } catch (error) {
      console.error(errorMessage, error);
      toast({
        title: "Erro",
        description: `${errorMessage}. Tente novamente.`,
        variant: 'destructive'
      });
    }
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => 
    handleEventOperation(addEventHandler(event), "Evento adicionado com sucesso.", "Falha ao adicionar evento");

  const updateEvent = (event: CalendarEvent) => 
    handleEventOperation(updateEventHandler(event), "Evento atualizado com sucesso.", "Falha ao atualizar evento");

  const deleteEvent = (eventId: string) => 
    handleEventOperation(deleteEventHandler(eventId), "Evento deletado com sucesso.", "Falha ao deletar evento");

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(event.category);
      const searchMatch = searchTerm === '' || event.title.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [events, selectedCategories, searchTerm]);

  const dailyEventsForModal = useMemo(() => {
    if (!selectedDateForModal) return [];
    const dateStr = format(selectedDateForModal, 'yyyy-MM-dd');
    
    return filteredEvents
      .filter(event => {
        const eventStartDate = event.startDate.split('T')[0];
        const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
        return dateStr >= eventStartDate && dateStr <= eventEndDate;
      })
      .sort((a, b) => {
        // 1. Ordena pela prioridade da categoria
        const orderA = getCategoryOrder(a.category);
        const orderB = getCategoryOrder(b.category);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // 2. Se a categoria for a mesma, ordena pelo título
        return a.title.localeCompare(b.title);
      });
  }, [selectedDateForModal, filteredEvents]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDateForModal(date);
  };
  
  const handleAddNewEvent = (date?: Date) => {
    if (!canEdit) return;
    const defaultDate = date || new Date();
    setSelectedEvent({
      id: '', // ID vazio para um novo evento
      title: '',
      startDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm:ss"),
      endDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm:ss"),
      category: categories[0]?.id || '',
      description: '',
      location: '',
    });
    setIsEventModalOpen(true);
  };

  const closeModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
    if (selectedDateForModal) {
      setSelectedDateForModal(null);
    }
  };

  const isLoading = authLoading || eventsLoading || categoriesLoading;

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header 
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        onSearchChange={setSearchTerm}
        onAddNewEvent={() => handleAddNewEvent()}
        canEdit={canEdit}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        events={filteredEvents}
      />
      <main className="flex-1 overflow-auto p-4" id="calendar-main">
        <Calendar 
          events={filteredEvents} 
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
          categories={categories as CategoryConfig[]}
          currentMonth={currentMonth}
          onEventUpdate={updateEvent}
          canEdit={canEdit}
        />
      </main>
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={closeModal}
          eventData={selectedEvent}
          onSave={selectedEvent?.id ? updateEvent : addEvent}
          onDelete={deleteEvent}
          categories={categories as CategoryConfig[]}
          canEdit={canEdit}
        />
      )}
      {selectedDateForModal && (
        <DayEventModal 
          isOpen={!!selectedDateForModal}
          onClose={closeModal}
          date={selectedDateForModal}
          events={dailyEventsForModal}
          categories={categories as CategoryConfig[]}
          onEventClick={handleEventClick}
          onAddNewEvent={handleAddNewEvent}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
