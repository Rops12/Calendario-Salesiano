import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Flex,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, add } from 'date-fns';

// Hooks
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';

// Componentes
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { CalendarGrid } from '@/components/Calendar/CalendarGrid';
import { EventModal } from '@/components/Calendar/EventModal';
import { CategoryFilters } from '@/components/Calendar/CategoryFilters';
import { ViewSwitcher } from '@/components/Calendar/ViewSwitcher';
import { AgendaView } from '@/components/Calendar/AgendaView';
import CalendarSkeleton from '@/components/Calendar/CalendarSkeleton';
import { Sidebar } from '@/components/ui/sidebar';
import AdminPanel from '@/components/Admin/AdminPanel';
import { Toaster } from '@/components/ui/toaster'; // Import corrigido

// Entidades e Tipos
import { Event } from '@/entities/Event';

type View = 'monthly' | 'weekly' | 'agenda';

type EventFormData = {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  category: string;
  eventType: 'normal' | 'importante' | 'feriado';
};

export default function Index() {
  const { user, isAdmin } = useAuth();
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { categories, selectedCategories, handleCategoryChange } = useCategories();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<View>('monthly');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Memoiza os eventos filtrados para evitar recálculos desnecessários
  const filteredEvents = useMemo(() => {
    if (selectedCategories.length === 0) {
      return events;
    }
    return events.filter((event) => selectedCategories.includes(event.category));
  }, [events, selectedCategories]);

  // Funções de callback memoizadas para evitar re-renderizações dos filhos
  const handleDateClick = useCallback((date: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    onModalOpen();
  }, [onModalOpen]);

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    onModalOpen();
  }, [onModalOpen]);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
    setSelectedDate(null);
    onModalClose();
  }, [onModalClose]);

  const handleSaveEvent = useCallback(async (eventData: EventFormData, id?: number) => {
    // Normaliza as datas para o formato ISO antes de enviar para o backend
    const payload = {
      ...eventData,
      startDate: new Date(eventData.startDate).toISOString(),
      endDate: eventData.endDate ? new Date(eventData.endDate).toISOString() : undefined,
    };

    if (id) {
      await updateEvent(id, payload);
    } else {
      await createEvent(payload);
    }
  }, [createEvent, updateEvent]);

  const handleDeleteEvent = useCallback(async (id: number) => {
    await deleteEvent(id);
    handleCloseModal();
  }, [deleteEvent, handleCloseModal]);

  const handleEventDrop = useCallback(async (item: { id: number }, date: Date) => {
    const event = events.find((e) => e.id === item.id);
    if (event) {
      const originalStartDate = new Date(event.startDate);
      const originalEndDate = event.endDate ? new Date(event.endDate) : null;
      const duration = originalEndDate ? originalEndDate.getTime() - originalStartDate.getTime() : 0;
      
      const newStartDate = new Date(date);
      const newEndDate = duration > 0 ? new Date(newStartDate.getTime() + duration) : null;

      const updatedEvent = {
        ...event,
        startDate: newStartDate.toISOString(),
        endDate: newEndDate ? newEndDate.toISOString() : undefined,
      };
      await updateEvent(item.id, updatedEvent);
    }
  }, [events, updateEvent]);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex direction={{ base: 'column', md: 'row' }} h="100vh" bg="gray.50">
        <Toaster /> {/* Componente de notificação adicionado */}
        {isAdmin && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}>
            <AdminPanel />
          </Sidebar>
        )}
        <Box flex="1" p={{ base: 2, md: 6 }} overflowY="auto" display="flex" flexDirection="column">
          <CalendarHeader
            currentDate={currentDate}
            setCurrentDate={setCurrentDate} // Passando o setter diretamente
            onAddEvent={() => handleDateClick(new Date())}
            isAdmin={isAdmin}
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          />

          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            mb={4}
            flexWrap="wrap"
          >
            <CategoryFilters
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
            <ViewSwitcher view={view} setView={setView} />
          </Flex>

          <Box flex="1">
            {view === 'monthly' && (
              <CalendarGrid
                currentDate={currentDate}
                events={filteredEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                isAdmin={!!isAdmin}
              />
            )}
            {view === 'agenda' && <AgendaView events={filteredEvents} onEventClick={handleEventClick} />}
            {/* Adicionar outras visualizações como WeekView aqui */}
          </Box>
        </Box>
      </Flex>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={isAdmin ? handleDeleteEvent : undefined}
        event={selectedEvent}
        selectedDate={selectedDate}
        categories={categories}
      />
    </DndProvider>
  );
}