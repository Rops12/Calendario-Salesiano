import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, EventFormData, eventCategories, EventType } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: EventFormData) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
}

export function EventModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  event, 
  selectedDate 
}: EventModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'geral',
    eventType: 'evento'
  });

  useEffect(() => {
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
        category: 'geral',
        eventType: 'normal'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        category: 'geral',
        eventType: 'normal'
      });
    }
  }, [event, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do evento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (onSave) {
      onSave(formData);
      onClose();
      
      toast({
        title: event ? "Evento atualizado" : "Evento criado",
        description: event ? "O evento foi atualizado com sucesso." : "O evento foi criado com sucesso.",
      });
    }
  };

  const isReadOnly = !onSave && !onDelete;

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
      
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? 'Visualizar Evento' : (event ? 'Editar Evento' : 'Novo Evento')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título do evento"
              required
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição do evento (opcional)"
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data de Fim (opcional)</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Tipo de Evento</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData({ ...formData, eventType: value as EventType })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    Normal
                  </div>
                </SelectItem>
                <SelectItem value="evento">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Evento
                  </div>
                </SelectItem>
                <SelectItem value="feriado">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Feriado
                  </div>
                </SelectItem>
                <SelectItem value="recesso">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    Recesso
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                 {eventCategories.map((category) => (
                   <SelectItem key={category.value} value={category.value}>
                     <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-3 h-3 rounded-full",
                         {
                           'bg-blue-500': category.value === 'geral',
                           'bg-yellow-500': category.value === 'infantil',
                           'bg-green-500': category.value === 'fundamental1',
                           'bg-cyan-500': category.value === 'fundamental2',
                           'bg-purple-500': category.value === 'medio',
                           'bg-pink-500': category.value === 'pastoral',
                           'bg-orange-500': category.value === 'esportes',
                           'bg-indigo-500': category.value === 'robotica',
                           'bg-emerald-500': category.value === 'biblioteca',
                           'bg-rose-500': category.value === 'nap'
                         }
                       )} />
                       {category.label}
                     </div>
                   </SelectItem>
                 ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {!isReadOnly && event && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? 'Fechar' : 'Cancelar'}
              </Button>
              {!isReadOnly && onSave && (
                <Button type="submit">
                  {event ? 'Atualizar' : 'Criar'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}