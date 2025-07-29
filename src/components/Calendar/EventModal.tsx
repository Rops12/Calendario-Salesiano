// src/components/Calendar/EventModal.tsx
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, EventFormData, EventType, EventCategory } from '@/types/calendar';
import { CategoryConfig } from '@/types/admin';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';
import { format } from 'date-fns'; // Importar format

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: EventFormData) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  categories: CategoryConfig[];
}

const eventTypeOptions: { value: EventType, label: string, description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Atividade comum do dia a dia.' },
  { value: 'evento', label: 'Evento Especial', description: 'Grande evento que envolve vários segmentos.' },
  { value: 'feriado', label: 'Feriado', description: 'Feriado oficial, sem atividades letivas.' },
  { value: 'recesso', label: 'Recesso', description: 'Pausa nas atividades, como emendas de feriado.' },
];

const TRANSITION = { type: "spring", bounce: 0.1, duration: 0.4 };
const variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
  categories
}: EventModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: categories[0]?.value || '',
    eventType: 'normal'
  });

  useEffect(() => {
    const defaultCategory = categories[0]?.value || '';
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate || '',
        category: event.category,
        eventType: event.eventType
      });
    } else if (selectedDate) {
      setFormData({
        title: '',
        description: '',
        // CORREÇÃO: Usar format para evitar problemas de fuso horário
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        endDate: '',
        category: defaultCategory,
        eventType: 'normal'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        category: defaultCategory,
        eventType: 'normal'
      });
    }
  }, [event, selectedDate, isOpen, categories]);

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") onClose();
      };
      if (isOpen) {
          document.addEventListener("keydown", handleKeyDown);
      }
      return () => {
          document.removeEventListener("keydown", handleKeyDown);
      };
  }, [isOpen, onClose]);

  const handleCategoryChange = (value: EventCategory) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Erro", description: "O título do evento é obrigatório.", variant: "destructive" });
      return;
    }
    if (onSave) {
      onSave(formData);
      onClose();
    }
  };

  const isReadOnly = !onSave && !onDelete;

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleEventTypeChange = (value: EventType) => {
    setFormData(prev => ({...prev, eventType: value}));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-lg flex flex-col"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={TRANSITION}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b shrink-0">
                <h3 className="font-semibold text-lg">{isReadOnly ? 'Visualizar Evento' : (event ? 'Editar Evento' : 'Novo Evento')}</h3>
                <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </header>

              <div className="py-4 px-4 space-y-4 flex-grow overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Digite o título do evento" required disabled={isReadOnly} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Digite a descrição do evento (opcional)" rows={3} disabled={isReadOnly} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required disabled={isReadOnly} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Fim (opcional)</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate} disabled={isReadOnly} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Segmento</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Tipo de Ocasião</Label>
                  <RadioGroup value={formData.eventType} onValueChange={handleEventTypeChange} className="space-y-2" disabled={isReadOnly}>
                    {eventTypeOptions.map(option => (
                      <Label key={option.value} className={cn("flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer", formData.eventType === option.value ? "bg-muted border-primary ring-2 ring-primary/50" : "hover:bg-muted/50")}>
                        <RadioGroupItem value={option.value} />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <footer className="flex justify-between w-full p-4 border-t bg-background shrink-0">
                <div>
                  {!isReadOnly && event && onDelete && (<Button type="button" variant="destructive" onClick={handleDelete}>Excluir</Button>)}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>{isReadOnly ? 'Fechar' : 'Cancelar'}</Button>
                  {!isReadOnly && onSave && (<Button type="submit">{event ? 'Atualizar' : 'Criar'}</Button>)}
                </div>
              </footer>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
