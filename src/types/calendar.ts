export type EventCategory = 
  | 'geral'
  | 'infantil' 
  | 'fundamental1'
  | 'fundamental2'
  | 'medio'
  | 'pastoral'
  | 'esportes'
  | 'robotica'
  | 'biblioteca'
  | 'nap';

export type EventType = 'normal' | 'evento' | 'feriado' | 'recesso';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string para eventos com intervalo
  category: EventCategory;
  eventType: EventType;
  createdAt: string;
  updatedAt: string;
  // Backward compatibility
  date: string; // ISO date string - maps to startDate
  isHoliday?: boolean; // maps to eventType
}

export interface EventFormData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  category: EventCategory;
  eventType: EventType;
}

export const eventCategories: { value: EventCategory; label: string; color: string }[] = [
  { value: 'geral', label: 'Geral', color: 'category-geral' },
  { value: 'infantil', label: 'Ensino Infantil', color: 'category-infantil' },
  { value: 'fundamental1', label: 'Fundamental I', color: 'category-fundamental1' },
  { value: 'fundamental2', label: 'Fundamental II', color: 'category-fundamental2' },
  { value: 'medio', label: 'Ensino Médio', color: 'category-medio' },
  { value: 'pastoral', label: 'Pastoral', color: 'category-pastoral' },
  { value: 'esportes', label: 'Esportes', color: 'category-esportes' },
  { value: 'robotica', label: 'Robótica', color: 'category-robotica' },
  { value: 'biblioteca', label: 'Biblioteca', color: 'category-biblioteca' },
  { value: 'nap', label: 'NAP', color: 'category-nap' },
];