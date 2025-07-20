import { useState, useEffect } from 'react';
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

  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  // Save selected categories to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
    } else if (direction === 'prev') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToggleCategory = (category: EventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(undefined);
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
    if (selectedEvent) {
      updateEvent(selectedEvent.id, data);
    } else {
      createEvent(data);
    }
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
  };

  const handleEventDrop = (eventId: string, newDate: string) => {
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

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onNewEvent={handleNewEvent}
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
        {currentView === 'month' && (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            selectedCategories={selectedCategories}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
          />
        )}
        
        {currentView === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            selectedCategories={selectedCategories}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
        
        {currentView === 'agenda' && (
          <AgendaView
            currentDate={currentDate}
            events={filteredEvents}
            selectedCategories={selectedCategories}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
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
