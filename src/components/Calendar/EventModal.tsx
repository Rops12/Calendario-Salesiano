import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Event } from '@/entities/Event';

// Schema de validação com Zod
const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres.' }),
  description: z.string().optional(),
  startDate: z.string().nonempty({ message: 'A data de início é obrigatória.' }),
  endDate: z.string().optional(),
  category: z.string().nonempty({ message: 'A categoria é obrigatória.' }),
  eventType: z.enum(['normal', 'importante', 'feriado']),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData, id?: number) => void;
  onDelete?: (id: number) => void;
  event?: Event | null;
  selectedDate?: Date | null;
  categories: { value: string; label: string }[];
}

// Função auxiliar para obter os dados iniciais do formulário
// Movida para fora do componente para não ser recriada a cada renderização
const getInitialFormData = (
  event: Event | null | undefined,
  selectedDate: Date | null | undefined,
  categories: { value: string; label: string }[]
): EventFormData => {
  const defaultCategory = categories[0]?.value || '';
  const date = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  if (event) {
    return {
      title: event.title,
      description: event.description || '',
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : '',
      category: event.category,
      eventType: event.eventType,
    };
  }

  return {
    title: '',
    description: '',
    startDate: date,
    endDate: '',
    category: defaultCategory,
    eventType: 'normal',
  };
};

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
  categories,
}: EventModalProps) {
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  });

  // Efeito para resetar o formulário APENAS quando o modal é aberto
  // ou quando o evento/data selecionada muda.
  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData(event, selectedDate, categories);
      reset(initialData);
    }
  }, [isOpen, event, selectedDate, categories, reset]);

  const handleFormSubmit: SubmitHandler<EventFormData> = (data) => {
    onSave(data, event?.id);
    onClose();
  };

  const handleDeleteClick = () => {
    if (event?.id && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleClose = () => {
    reset(); // Limpa o formulário ao fechar manualmente
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalHeader>{event ? 'Editar Evento' : 'Criar Novo Evento'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Título</FormLabel>
              <Controller
                name="title"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.title && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.title.message}</p>}
            </FormControl>

            <FormControl>
              <FormLabel>Descrição</FormLabel>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Textarea {...field} />}
              />
            </FormControl>

            <HStack width="100%">
              <FormControl isInvalid={!!errors.startDate}>
                <FormLabel>Data de Início</FormLabel>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                 {errors.startDate && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.startDate.message}</p>}
              </FormControl>
              <FormControl>
                <FormLabel>Data de Fim</FormLabel>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
              </FormControl>
            </HStack>

            <FormControl isInvalid={!!errors.category}>
              <FormLabel>Categoria</FormLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
               {errors.category && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.category.message}</p>}
            </FormControl>

            <FormControl>
              <FormLabel>Tipo de Evento</FormLabel>
              <Controller
                name="eventType"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                    <option value="feriado">Feriado</option>
                  </Select>
                )}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack justify="space-between" width="100%">
            {event && onDelete && (
                 <Tooltip label="Excluir evento" placement="top">
                 <IconButton
                   aria-label="Excluir evento"
                   icon={<FaTrash />}
                   colorScheme="red"
                   onClick={handleDeleteClick}
                 />
               </Tooltip>
            )}
            <HStack marginLeft="auto">
                <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
                <Button colorScheme="blue" type="submit">
                    Salvar
                </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}