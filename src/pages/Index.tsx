// src/pages/Index.tsx
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/Calendar';
import { Header } from '@/components/Header';
import { EventModal } from '@/components/Calendar/EventModal';
import { DayEventModal } from '@/components/Calendar/DayEventModal';
import { useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';

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
  const { user, canEdit } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { categories } = useCategories();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    setSelectedEvent({
      id: '',
      title: '',
      startDate: date ? format(date, 'yyyy-MM-dd HH:mm:ss') : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      endDate: date ? format(date, 'yyyy-MM-dd HH:mm:ss') : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      category: categories[0]?.id || '',
      description: '',
      location: '',
    });
    setIsEventModalOpen(true);
  };

  const closeModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
    setSelectedDateForModal(null);
  };

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
      />
      <main className="flex-1 overflow-auto p-4">
        <Calendar 
          events={filteredEvents} 
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
          categories={categories}
          currentMonth={currentMonth}
        />
      </main>
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={closeModal}
          event={selectedEvent}
          onSave={selectedEvent?.id ? updateEvent : addEvent}
          onDelete={deleteEvent}
          categories={categories}
        />
      )}
      {selectedDateForModal && (
        <DayEventModal 
          isOpen={!!selectedDateForModal}
          onClose={closeModal}
          date={selectedDateForModal}
          events={dailyEventsForModal}
          categories={categories}
          onEventClick={handleEventClick}
          onAddNewEvent={handleAddNewEvent}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
