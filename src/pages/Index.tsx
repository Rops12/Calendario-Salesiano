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
import { CalendarEvent, EventCategory, EventFormData, eventCategories, EventType } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { CalendarSkeleton } from '@/components/Calendar/CalendarSkeleton';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';


const Index = () => {
  const navigate = useNavigate();
  const params = useParams();

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
  
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [daySheetEvents, setDaySheetEvents] = useState<CalendarEvent[]>([]);
  const [daySheetDate, setDaySheetDate] = useState<Date | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | null>(null);

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
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
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

  const handleDateClickForSheet = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const eventsForDay = filteredEvents.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      return dateStr >= eventStartDate && dateStr <= eventEndDate;
    });
    setDaySheetEvents(eventsForDay.sort((a, b) => a.title.localeCompare(b.title)));
    setDaySheetDate(date);
    setIsDaySheetOpen(true);
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
        ...event,
        startDate: newDate,
      });
      toast({ title: "Evento reagendado", description: "O evento foi movido com sucesso." });
    }
  };

  const filteredEvents = useMemo(() => events.filter(event =>
    (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    selectedCategories.includes(event.category)
  ), [events, searchQuery, selectedCategories]);

  const animationClass = 
    transitionDirection === 'next' ? 'animate-[slide-in-from-right_0.3s_ease-out]' :
    transitionDirection === 'prev' ? 'animate-[slide-in-from-left_0.3s_ease-out]' :
    'animate-fade-in';
    
  const renderView = () => {
    if (isInitialLoad) {
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
        return <CalendarGrid {...viewProps} onDateClick={handleDateClickForSheet} onAddNewEvent={handleNewEvent} onEventDrop={canEdit ? handleEventDrop : undefined} />;
      case 'week':
        return <WeekView {...viewProps} onDateClick={canEdit ? handleDateClickForSheet : undefined} />;
      case 'agenda':
        return <AgendaView {...viewProps} onNewEventClick={canEdit ? handleNewEvent : undefined} />;
      default:
        return null;
    }
  };

  const runCommand = (command: () => void) => {
    command();
    setIsCommandOpen(false);
  };
  
  const getCategoryData = (category: EventCategory) => {
    return eventCategories.find(cat => cat.value === category);
  };

  const getEventTypeStyles = (event: CalendarEvent) => {
    switch (event.eventType) {
      case 'feriado':
        return 'bg-red-100 text-red-800 border-red-200 font-semibold';
      case 'recesso':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
      default: // normal e evento
        return 'bg-card hover:bg-muted/50 text-card-foreground border';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onDateSelect={handleDateSelect}
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
      
      <div>
        <div key={currentDate.getTime()} className={animationClass}>
          {renderView()}
        </div>
      </div>

      <Sheet open={isDaySheetOpen} onOpenChange={setIsDaySheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {daySheetDate && format(daySheetDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </SheetTitle>
            <SheetDescription>
              {daySheetEvents.length} evento(s) encontrado(s).
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-3">
            {daySheetEvents.length > 0 ? daySheetEvents.map(event => {
                const categoryData = getCategoryData(event.category);
                return (
                    <div
                        key={event.id}
                        onClick={() => { handleEventClick(event); setIsDaySheetOpen(false); }}
                        className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                            "hover:scale-[1.02] hover:shadow-medium",
                            getEventTypeStyles(event)
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground mb-1 break-words whitespace-normal leading-tight">
                                    {event.title}
                                </h4>
                                {event.description && (
                                <p className="text-sm text-muted-foreground break-words whitespace-normal leading-tight mb-2">
                                    {event.description}
                                </p>
                                )}
                                <div className="flex items-center gap-2">
                                <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                                    'bg-muted text-muted-foreground'
                                )}>
                                    <div className={cn(
                                    "w-2 h-2 rounded-full mr-2",
                                    {
                                        'bg-category-geral': event.category === 'geral',
                                        'bg-category-infantil': event.category === 'infantil',
                                        'bg-category-fundamental1': event.category === 'fundamental1',
                                        'bg-category-fundamental2': event.category === 'fundamental2',
                                        'bg-category-medio': event.category === 'medio',
                                        'bg-category-pastoral': event.category === 'pastoral',
                                        'bg-category-esportes': event.category === 'esportes',
                                        'bg-category-robotica': event.category === 'robotica',
                                        'bg-category-biblioteca': event.category === 'biblioteca',
                                        'bg-category-nap': event.category === 'nap'
                                    }
                                    )} />
                                    {categoryData?.label}
                                </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }) : <p className="text-muted-foreground text-center py-8">Nenhum evento para este dia.</p>}
          </div>
          {canEdit && daySheetDate &&
            <Button onClick={() => { handleNewEvent(daySheetDate); setIsDaySheetOpen(false); }} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
            </Button>
          }
        </SheetContent>
      </Sheet>

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
          {canEdit && (
            <CommandGroup heading="Ações">
              <CommandItem onSelect={() => runCommand(() => handleNewEvent())}>Novo Evento</CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

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
