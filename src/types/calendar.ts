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

// A principal atualização está aqui, com a adição do campo `colorHex`
export const eventCategories = [
  { value: 'geral',        label: 'Geral',        color: 'category-geral',       colorHex: '#3b82f6' }, // Azul
  { value: 'infantil',     label: 'Ed. Infantil', color: 'category-infantil',    colorHex: '#f59e0b' }, // Ambar
  { value: 'fundamental1', label: 'Fund. I',      color: 'category-fundamental1',colorHex: '#22c55e' }, // Verde
  { value: 'fundamental2', label: 'Fund. II',     color: 'category-fundamental2',colorHex: '#14b8a6' }, // Teal
  { value: 'medio',        label: 'Ens. Médio',   color: 'category-medio',       colorHex: '#8b5cf6' }, // Violeta
  { value: 'pastoral',     label: 'Pastoral',     color: 'category-pastoral',    colorHex: '#ec4899' }, // Rosa
  { value: 'esportes',     label: 'Esportes',     color: 'category-esportes',    colorHex: '#f97316' }, // Laranja
  { value: 'robotica',     label: 'Robótica',     color: 'category-robotica',    colorHex: '#6366f1' }, // Indigo
  { value: 'biblioteca',   label: 'Biblioteca',   color: 'category-biblioteca',  colorHex: '#10b981' }, // Esmeralda
  { value: 'nap',          label: 'NAP',          color: 'category-nap',         colorHex: '#f43f5e' }, // Rosa Forte
] as const;
