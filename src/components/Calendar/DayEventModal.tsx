// src/components/Calendar/DayEventModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/types/calendar';
import { CategoryConfig } from '@/types/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { EventCard } from './EventCard';

interface DayEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewEvent: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  date: Date | null;
  events: CalendarEvent[];
  categories: CategoryConfig[];
  canEdit: boolean;
}

export function DayEventModal({ isOpen, onClose, onAddNewEvent, onEventClick, date, events, categories, canEdit }: DayEventModalProps) {
  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}</DialogTitle>
          <DialogDescription>{events.length} evento(s) encontrado(s).</DialogDescription>
        </DialogHeader>
        {/* Adicionado px-1 para evitar a barra de rolagem horizontal no hover */}
        <div className="py-4 px-1 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                onClick={() => { onEventClick(event); onClose(); }}
                className="hover:scale-[1.02] hover:shadow-medium"
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum evento para este dia.</p>
          )}
        </div>
        {canEdit && (
          <Button onClick={() => { onAddNewEvent(date); onClose(); }} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
