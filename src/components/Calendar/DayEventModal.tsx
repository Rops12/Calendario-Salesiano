// src/components/Calendar/DayEventModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/types/calendar';
import { CategoryConfig } from '@/types/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const getCategory = (categoryValue: string) => {
    return categories.find(c => c.value === categoryValue);
  }

  const getEventTypeStyles = (event: CalendarEvent) => {
    switch (event.eventType) {
      case 'feriado': return 'bg-red-100 text-red-800 border-red-200 font-semibold';
      case 'recesso': return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
      case 'evento': return 'bg-yellow-100 text-yellow-800 border-yellow-200 font-semibold';
      default: return 'bg-card hover:bg-muted/50 text-card-foreground border';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}</DialogTitle>
          <DialogDescription>{events.length} evento(s) encontrado(s).</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.length > 0 ? events.map(event => {
            const categoryData = getCategory(event.category) || { label: event.category, color: '#9ca3af' };
            return (
              <div key={event.id} onClick={() => { onEventClick(event); onClose(); }}
                className={cn("p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-medium", getEventTypeStyles(event))}>
                <div className="flex items-start gap-3">
                  {event.eventType === 'evento' && <Star className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 break-words whitespace-normal leading-tight">{event.title}</h4>
                    {event.description && (<p className="text-sm text-muted-foreground break-words whitespace-normal leading-tight mb-2">{event.description}</p>)}
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground')}>
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: categoryData.color }} />
                        {categoryData.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }) : <p className="text-muted-foreground text-center py-8">Nenhum evento para este dia.</p>}
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
