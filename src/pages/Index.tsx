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
import { useCategories } from '@/hooks/useCategories.tsx';
import { useAuth } from '@/hooks/useAuth';

import * as FloatingPanel from '@/components/ui/floating-panel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventCard } from '@/components/Calendar/EventCard';

const categoryOrder: { [key: string]: number } = {
  'geral': 1, 'feriado': 2, 'recesso': 3, 'evento': 4, 'infantil': 10,
  'fundamental1': 11, 'fundamental2': 12, 'medio': 13, 'pastoral': 20,
  'esportes': 21, 'biblioteca': 22, 'robotica': 23, 'nap': 24,
};
const getCategoryOrder = (category: string) => categoryOrder[category] || 99;


const Index = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { categories } = useCategories();
  const { isAuthenticated } = useAuth();

  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = params.date;
    if (dateParam) {
      const parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) return parsedDate;
    }
    return new Date();
  });

  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(categories.filter(c => c.isActive).map(c => c.value));
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

  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { isAdmin, canEdit: userCanEdit } = useAdmin();
  const canEdit = isAuthenticated && userCanEdit;
  const { toast } = useToast();

  useEffect(() => {
    setIsInitialLoad(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const dateParam = params.date;
    const newDate = dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date();
    if (isValid(newDate)) {
      setCurrentDate(newDate);
    }
  }, [params.date]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (direction: 'next' | 'prev' | 'today') => {
    setTransitionDirection(direction === 'today' ? null : direction);
    const newDate = direction === 'today' ? new Date() : new Date(currentDate);
    if (direction !== 'today') {
      const offset = direction === 'next' ? 1 : -1;
      if (currentView === 'month') newDate.setMonth(newDate.getMonth() + offset);
      else if (currentView === 'week') newDate.setDate(newDate.getDate() + (7 * offset));
      else newDate.setDate(newDate.getDate() + offset);
    }
    navigate(`/date/${format(newDate, 'yyyy-MM-dd')}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      navigate(`/date/${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleNewEvent = (date?: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date || currentDate);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (formData: EventFormData) => {
    const dataToSave = { ...formData, id: selectedEvent?.id };
    try {
        if (dataToSave.id) {
            await updateEvent(dataToSave.id, dataToSave);
            toast({ title: 'Sucesso', description: 'Evento atualizado com sucesso!' });
        } else {
            await createEvent(dataToSave);
            toast({ title: 'Sucesso', description: 'Evento criado com sucesso!' });
        }
        setIsModalOpen(false);
    } catch (error) {
        toast({ title: 'Erro', description: 'Não foi possível salvar o evento.', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
      try {
          await deleteEvent(id);
          toast({ title: 'Sucesso', description: 'Evento excluído com sucesso!' });
          setIsModalOpen(false);
      } catch (error) {
          toast({ title: 'Erro', description: 'Não foi possível excluir o evento.', variant: 'destructive' });
      }
  };

  const handleEventDrop = async (eventId: string, newDateStr: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
        const newStartDate = new Date(newDateStr);
        const oldStartDate = new Date(event.startDate);
        const oldEndDate = event.endDate ? new Date(event.endDate) : oldStartDate;

        const duration = oldEndDate.getTime() - oldStartDate.getTime();
        const newEndDate = new Date(newStartDate.getTime() + duration);

        await handleSaveEvent({
            ...event,
            startDate: newStartDate.toISOString().split('T')[0],
            endDate: newEndDate.toISOString().split('T')[0],
        });
    }
  };

  const handleToggleCategory = (categoryValue: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryValue)
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  const filteredEvents = useMemo(() => events.filter(event =>
    (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    selectedCategories.includes(event.category)
  ).sort((a, b) => {
    const orderA = getCategoryOrder(a.category);
    const orderB = getCategoryOrder(b.category);
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  }), [events, searchQuery, selectedCategories]);

  const runCommand = (command: () => void) => {
    setIsCommandOpen(false);
    command();
  };

  const animationClass =
    transitionDirection === 'next' ? 'animate-[slide-in-from-right_0.3s_ease-out]' :
    transitionDirection === 'prev' ? 'animate-[slide-in-from-left_0.3s_ease-out]' :
    'animate-fade-in';

  const renderView = () => {
    if (isInitialLoad) return <CalendarSkeleton />;
    const viewProps = { currentDate, events: filteredEvents, selectedCategories, onEventClick: handleEventClick };
    switch (currentView) {
      case 'month': return <CalendarGrid {...viewProps} onAddNewEvent={canEdit ? handleNewEvent : undefined} onEventDrop={canEdit ? handleEventDrop : undefined} events={filteredEvents} />;
      case 'week': return <WeekView {...viewProps} />;
      case 'agenda': return <AgendaView {...viewProps} onNewEventClick={canEdit ? handleNewEvent : undefined} />;
      default: return null;
    }
  };

  return (
    <FloatingPanel.Root>
      <div className="min-h-screen bg-gray-50">
        <CalendarHeader
          currentDate={currentDate} onNavigate={handleNavigate} onDateSelect={handleDateSelect}
          onNewEvent={canEdit ? handleNewEvent : undefined} onSearch={setSearchQuery} searchQuery={searchQuery}
          currentView={currentView} onViewChange={setCurrentView} events={filteredEvents}
          selectedCategories={selectedCategories} onAdminPanelOpen={() => setIsAdminPanelOpen(true)} isAdmin={isAdmin}
        />
        <CategoryFilters selectedCategories={selectedCategories} onToggleCategory={handleToggleCategory} />
        <div><div key={currentDate.getTime()} className={animationClass}>{renderView()}</div></div>

        <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
          <CommandInput placeholder="Digite um comando ou pesquise..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Eventos">
              {filteredEvents.map(event => (
                <CommandItem key={event.id} onSelect={() => runCommand(() => handleEventClick(event))}>
                  {event.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {isModalOpen && (
          <EventModal
            isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
            onSave={canEdit ? handleSaveEvent : undefined}
            onDelete={canEdit ? handleDeleteEvent : undefined}
            event={selectedEvent} selectedDate={selectedDate}
            categories={categories.filter(c => c.isActive)}
          />
        )}

        {isAdmin && <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />}
      </div>

      <FloatingPanel.Content>
        {({ activeDate, activeEvents }) =>
          activeDate && (
            <div className="flex flex-col h-full bg-background">
              <div className="p-4 border-b">
                <h3 className="font-semibold">{format(activeDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</h3>
                <p className="text-sm text-muted-foreground">{activeEvents.length} evento(s) encontrado(s).</p>
              </div>
              <div className="py-4 px-4 space-y-3 flex-grow overflow-y-auto">
                {activeEvents.length > 0 ? (
                  activeEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                      className="transition-all hover:scale-[1.02] hover:shadow-lg"
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground text-center py-8">Nenhum evento para este dia.</p>
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="p-4 border-t mt-auto">
                  <Button onClick={() => handleNewEvent(activeDate)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
                  </Button>
                </div>
              )}
            </div>
          )
        }
      </FloatingPanel.Content>
    </FloatingPanel.Root>
  );
};

export default Index;
