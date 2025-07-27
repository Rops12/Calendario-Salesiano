// src/pages/Index.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { CategoryFilters } from '@/components/Calendar/CategoryFilters';
import { CalendarGrid } from '@/components/Calendar/CalendarGrid';
import { WeekView } from '@/components/Calendar/WeekView';
import { AgendaView } from '@/components/Calendar/AgendaView';
import { EventModal } from '@/components/Calendar/EventModal';
import { AdminPanel } from '@/components/Admin/AdminPanel';
import { CalendarView } from '@/components/Calendar/ViewSwitcher';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAdmin } from '@/hooks/useAdmin';
import { CalendarEvent, EventFormData } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast.tsx';
import { CalendarSkeleton } from '@/components/Calendar/CalendarSkeleton';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DayEventModal } from '@/components/Calendar/DayEventModal';
import { useCategories } from '@/hooks/useCategories.tsx';

const Index = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { categories } = useCategories();

  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = params.date;
    if (dateParam) {
      const parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    return new Date();
  });

  const [currentView, setCurrentView] = useState<CalendarView>(() => {
    const viewParam = params.view as CalendarView;
    if (['month', 'week', 'agenda'].includes(viewParam)) {
      return viewParam;
    }
    return 'month';
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (categories.length > 0) {
      const saved = localStorage.getItem('selectedCategories');
      if (saved) {
        const savedParsed = JSON.parse(saved);
        const activeCategoryValues = categories.filter(c => c.isActive).map(c => c.value);
        setSelectedCategories(savedParsed.filter((val: string) => activeCategoryValues.includes(val)));
      } else {
        setSelectedCategories(categories.filter(c => c.isActive).map(c => c.value));
      }
    }
  }, [categories]);
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | null>(null);

  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);

  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { isAdmin, canEdit } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  useEffect(() => {
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    if (params.view !== currentView || params.date !== formattedDate) {
      navigate(`/${currentView}/${formattedDate}`, { replace: true });
    }
  }, [currentDate, currentView, navigate, params.view, params.date]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  useEffect(() => {
    if (selectedCategories.length > 0) {
        localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  useEffect(() => {
    if (transitionDirection) {
      const timer = setTimeout(() => setTransitionDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [transitionDirection]);

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction !== 'today') setTransitionDirection(direction);
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month': newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1), 1); break;
      case 'week': newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7)); break;
      case 'agenda': newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1)); break;
    }
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) setCurrentDate(date);
  };

  const handleToggleCategory = (categoryValue: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryValue) 
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
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

  const handleDateClickForModal = (date: Date) => {
    setSelectedDateForModal(date);
    setIsDayModalOpen(true);
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
      updateEvent(eventId, { ...event, startDate: newDate });
      toast({ title: "Evento reagendado", description: "O evento foi movido com sucesso." });
    }
  };

  const filteredEvents = useMemo(() => events.filter(event =>
    (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    selectedCategories.includes(event.category)
  ), [events, searchQuery, selectedCategories]);

  const dailyEventsForModal = useMemo(() => {
    if (!selectedDateForModal) return [];
    const dateStr = format(selectedDateForModal, 'yyyy-MM-dd');
    return filteredEvents.filter(event => {
        const eventStartDate = event.startDate.split('T')[0];
        const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
        return dateStr >= eventStartDate && dateStr <= eventEndDate;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedDateForModal, filteredEvents]);

  const animationClass = 
    transitionDirection === 'next' ? 'animate-[slide-in-from-right_0.3s_ease-out]' :
    transitionDirection === 'prev' ? 'animate-[slide-in-from-left_0.3s_ease-out]' :
    'animate-fade-in';
    
  const renderView = () => {
    if (isInitialLoad) return <CalendarSkeleton />;
    const viewProps = { currentDate, events: filteredEvents, selectedCategories, onEventClick: handleEventClick };
    switch (currentView) {
      case 'month': return <CalendarGrid {...viewProps} onDateClick={handleDateClickForModal} onAddNewEvent={handleNewEvent} onEventDrop={canEdit ? handleEventDrop : undefined} />;
      case 'week': return <WeekView {...viewProps} onDateClick={canEdit ? handleDateClickForModal : undefined} />;
      case 'agenda': return <AgendaView {...viewProps} onNewEventClick={canEdit ? handleNewEvent : undefined} />;
      default: return null;
    }
  };

  const runCommand = (command: () => void) => {
    command();
    setIsCommandOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHeader
        currentDate={currentDate} onNavigate={handleNavigate} onDateSelect={handleDateSelect}
        onNewEvent={canEdit ? handleNewEvent : undefined} onSearch={setSearchQuery} searchQuery={searchQuery}
        currentView={currentView} onViewChange={setCurrentView} events={filteredEvents}
        selectedCategories={selectedCategories} onAdminPanelOpen={() => setIsAdminPanelOpen(true)} isAdmin={isAdmin}
      />
      <CategoryFilters selectedCategories={selectedCategories} onToggleCategory={handleToggleCategory} />
      <div><div key={currentDate.getTime()} className={animationClass}>{renderView()}</div></div>

      <DayEventModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={selectedDateForModal}
        events={dailyEventsForModal}
        onAddNewEvent={handleNewEvent}
        onEventClick={handleEventClick}
        categories={categories.filter(c => c.isActive)}
        canEdit={!!canEdit}
      />

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Digite um comando ou pesquise..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            <CommandItem onSelect={() => runCommand(() => handleNavigate('today'))}>Ir para Hoje</CommandItem>
            <CommandItem onSelect={() => runCommand(() => handleNavigate('next'))}>Próximo Período</CommandItem>
            <CommandItem onSelect={() => runCommand(() => handleNavigate('prev'))}>Período Anterior</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Visualização">
            <CommandItem onSelect={() => runCommand(() => setCurrentView('month'))}>Mudar para Mês</CommandItem>
            <CommandItem onSelect={() => runCommand(() => setCurrentView('week'))}>Mudar para Semana</CommandItem>
            <CommandItem onSelect={() => runCommand(() => setCurrentView('agenda'))}>Mudar para Agenda</CommandItem>
          </CommandGroup>
          {canEdit && (<CommandGroup heading="Ações"><CommandItem onSelect={() => runCommand(() => handleNewEvent())}>Novo Evento</CommandItem></CommandGroup>)}
        </CommandList>
      </CommandDialog>

      <EventModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onSave={canEdit ? handleSaveEvent : undefined}
        onDelete={canEdit ? handleDeleteEvent : undefined}
        event={selectedEvent} selectedDate={selectedDate}
        categories={categories.filter(c => c.isActive)}
      />
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </div>
  );
};

export default Index;
