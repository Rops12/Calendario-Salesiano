export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  category: EventCategory;
  eventType: EventType;
}

export interface CalendarEvent extends EventFormData {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory = 'geral' | 'infantil' | 'fundamental1' | 'fundamental2' | 'medio' | 'pastoral' | 'esportes' | 'robotica' | 'biblioteca' | 'nap';
export type EventType = 'normal' | 'feriado' | 'recesso' | 'evento';

export const eventCategories = [
  { value: 'geral',        label: 'Geral',        color: 'category-geral' },
  { value: 'infantil',     label: 'Ed. Infantil', color: 'category-infantil' },
  { value: 'fundamental1', label: 'Fund. I',      color: 'category-fundamental1' },
  { value: 'fundamental2', label: 'Fund. II',     color: 'category-fundamental2' },
  { value: 'medio',        label: 'Ens. Médio',   color: 'category-medio' },
  { value: 'pastoral',     label: 'Pastoral',     color: 'category-pastoral' },
  { value: 'esportes',     label: 'Esportes',     color: 'category-esportes' },
  { value: 'robotica',     label: 'Robótica',     color: 'category-robotica' },
  { value: 'biblioteca',   label: 'Biblioteca',   color: 'category-biblioteca' },
  { value: 'nap',          label: 'NAP',          color: 'category-nap' },
] as const;
