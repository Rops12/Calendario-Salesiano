import { useState, useEffect, useMemo } from 'react';
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { CategoryFilters } from '@/components/Calendar/CategoryFilters';
import { CalendarGrid } from '@/components/Calendar/CalendarGrid';
import { WeekView } from '@/components/Calendar/WeekView';
import { AgendaView } from '@/components/Calendar/AgendaView';
import { EventModal } from '@/components/Calendar/EventModal';
import { AdminPanel } from '@/components/Admin/AdminPanel';
import { ViewSwitcher, CalendarView } from '@/components/Calendar/ViewSwitcher';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAdmin } from '@/hooks/useAdmin';
import { CalendarEvent, EventCategory, EventFormData } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { CalendarSkeleton } from '@/components/Calendar/CalendarSkeleton'; // Importe o novo componente

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>(() => {
    const saved = localStorage.getItem('selectedCategories');
    return saved ? JSON.parse(saved) : [
      'geral', 'infantil', 'fundamental1', 'fundamental2', 'medio', 
      'pastoral', 'esportes', 'robotica', 'biblioteca', 'nap'
    ];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | null>(null);

  const { events, createEvent, updateEvent, deleteEvent, isLoading } = useCalendarEvents(); // Adicione isLoading
  const { isAdmin, canEdit } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);
  
  // Adiciona um pequeno timeout para a animação de transição
  useEffect(() => {
    if (transitionDirection) {
      const timer = setTimeout(() => setTransitionDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [transitionDirection]);

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction !== 'today') {
      setTransitionDirection(direction);
    }
    
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const newDate = new Date(currentDate);

    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'agenda':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleToggleCategory = (category: EventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNewEvent = (date?: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (data: EventFormData) => {
    if (!canEdit) return;
    
    if (selectedEvent) {
      updateEvent(selectedEvent.id, data);
    } else {
      createEvent(data);
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (!canEdit) return;
    deleteEvent(id);
  };

  const handleEventDrop = (eventId: string, newDate: string) => {
    if (!canEdit) return;
    
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEvent(eventId, { 
        title: event.title,
        description: event.description || '',
        startDate: newDate,
        endDate: event.endDate,
        category: event.category,
        eventType: event.eventType
      });
      toast({
        title: "Evento reagendado",
        description: "O evento foi movido com sucesso.",
      });
    }
  };

  const filteredEvents = useMemo(() => events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [events, searchQuery]);

  // Define a classe de animação com base na direção da transição
  const animationClass = 
    transitionDirection === 'next' ? 'animate-[slide-in-from-right_0.3s_ease-out]' :
    transitionDirection === 'prev' ? 'animate-[slide-in-from-left_0.3s_ease-out]' :
    'animate-fade-in';
    
  const renderView = () => {
    if (isLoading) {
      return <CalendarSkeleton />;
    }
    
    const viewProps = {
        currentDate,
        events: filteredEvents,
        selectedCategories,
        onEventClick: handleEventClick,
    };

    switch (currentView) {
      case 'month':
        return <CalendarGrid {...viewProps} onDateClick={handleDateClick} onEventDrop={canEdit ? handleEventDrop : undefined} />;
      case 'week':
        return <WeekView {...viewProps} onDateClick={canEdit ? handleDateClick : undefined} onNewEventClick={canEdit ? handleNewEvent : undefined} />;
      case 'agenda':
        return <AgendaView {...viewProps} onNewEventClick={canEdit ? handleNewEvent : undefined} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onNewEvent={canEdit ? handleNewEvent : undefined}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        currentView={currentView}
        onViewChange={setCurrentView}
        events={filteredEvents}
        selectedCategories={selectedCategories}
        onAdminPanelOpen={() => setIsAdminPanelOpen(true)}
        isAdmin={isAdmin}
      />
      
      <CategoryFilters
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
      />
      
      <div className="p-6">
        <div key={currentDate.getTime()} className={animationClass}>
          {renderView()}
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={canEdit ? handleSaveEvent : undefined}
        onDelete={canEdit ? handleDeleteEvent : undefined}
        event={selectedEvent}
        selectedDate={selectedDate}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
};

export default Index;
