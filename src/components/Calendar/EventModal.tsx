// src/components/Calendar/EventModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, EventFormData, EventType, EventCategory } from '@/types/calendar';
import { CategoryConfig } from '@/types/admin'; // Importado
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: EventFormData) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  categories: CategoryConfig[]; // Propriedade adicionada
}

const eventTypeOptions: { value: EventType, label: string, description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Atividade comum do dia a dia.' },
  { value: 'evento', label: 'Evento Especial', description: 'Grande evento que envolve vários segmentos.' },
  { value: 'feriado', label: 'Feriado', description: 'Feriado oficial, sem atividades letivas.' },
  { value: 'recesso', label: 'Recesso', description: 'Pausa nas atividades, como emendas de feriado.' },
];

export function EventModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  event, 
  selectedDate,
  categories // Propriedade recebida
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
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        category: event.category,
        eventType: event.eventType
      });
    } else if (selectedDate) {
      setFormData({
        title: '',
        description: '',
        startDate: selectedDate.toISOString().split('T')[0],
        endDate: '',
        category: defaultCategory,
        eventType: 'normal'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        category: defaultCategory,
        eventType: 'normal'
      });
    }
  }, [event, selectedDate, isOpen, categories]);

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
      toast({ title: event ? "Evento atualizado" : "Evento criado", description: event ? "O evento foi atualizado com sucesso." : "O evento foi criado com sucesso." });
    }
  };

  const isReadOnly = !onSave && !onDelete;

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
      toast({ title: "Evento excluído", description: "O evento foi excluído com sucesso." });
    }
  };
  
  const handleEventTypeChange = (value: EventType) => {
    setFormData(prev => ({...prev, eventType: value}));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? 'Visualizar Evento' : (event ? 'Editar Evento' : 'Novo Evento')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... campos de título, descrição, datas ... */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Digite o título do evento" required disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Digite a descrição do evento (opcional)" rows={3} disabled={isReadOnly} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                {/* O select agora usa as categorias dinâmicas */}
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
          <div className="flex justify-between pt-4">
            <div>
              {!isReadOnly && event && onDelete && (<Button type="button" variant="destructive" onClick={handleDelete}>Excluir</Button>)}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>{isReadOnly ? 'Fechar' : 'Cancelar'}</Button>
              {!isReadOnly && onSave && (<Button type="submit">{event ? 'Atualizar' : 'Criar'}</Button>)}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
