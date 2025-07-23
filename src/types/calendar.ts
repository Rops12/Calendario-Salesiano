export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  category: EventCategory;
  eventType: EventType;
}

export interface CalendarEvent extends Omit<EventFormData, 'category'> {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  category: EventCategory;
}

export type EventCategory = 'geral' | 'infantil' | 'fundamental1' | 'fundamental2' | 'medio' | 'pastoral' | 'esportes' | 'robotica' | 'biblioteca' | 'nap';
export type EventType = 'normal' | 'feriado' | 'recesso' | 'evento';

interface CategoryInfo {
  value: EventCategory;
  label: string;
  color: string; // Legado, mantido para referência se necessário
  colorHex: string; // Adicionado para o export
  tw: {
    background: string;
    foreground: string;
    border: string;
    hoverBackground: string;
  };
}

// NOVA PALETA DE CORES - Acessível e Moderna
export const eventCategories: readonly CategoryInfo[] = [
  // ALTERAÇÃO: "Geral" agora é "Toda Escola"
  { value: 'geral',        label: 'Toda Escola',  color: 'category-geral', colorHex: '#3b82f6', tw: { background: 'bg-blue-100', foreground: 'text-blue-800', border: 'border-blue-500', hoverBackground: 'hover:bg-blue-200' }},
  { value: 'infantil',     label: 'Ed. Infantil', color: 'category-infantil', colorHex: '#f59e0b', tw: { background: 'bg-amber-100', foreground: 'text-amber-800', border: 'border-amber-500', hoverBackground: 'hover:bg-amber-200' }},
  { value: 'fundamental1', label: 'Fund. I',      color: 'category-fundamental1', colorHex: '#22c55e', tw: { background: 'bg-green-100', foreground: 'text-green-800', border: 'border-green-500', hoverBackground: 'hover:bg-green-200' }},
  { value: 'fundamental2', label: 'Fund. II',     color: 'category-fundamental2', colorHex: '#06b6d4', tw: { background: 'bg-cyan-100', foreground: 'text-cyan-800', border: 'border-cyan-500', hoverBackground: 'hover:bg-cyan-200' }},
  { value: 'medio',        label: 'Ens. Médio',   color: 'category-medio', colorHex: '#8b5cf6', tw: { background: 'bg-violet-100', foreground: 'text-violet-800', border: 'border-violet-500', hoverBackground: 'hover:bg-violet-200' }},
  { value: 'pastoral',     label: 'Pastoral',     color: 'category-pastoral', colorHex: '#ec4899', tw: { background: 'bg-pink-100', foreground: 'text-pink-800', border: 'border-pink-500', hoverBackground: 'hover:bg-pink-200' }},
  { value: 'esportes',     label: 'Esportes',     color: 'category-esportes', colorHex: '#f97316', tw: { background: 'bg-orange-100', foreground: 'text-orange-800', border: 'border-orange-500', hoverBackground: 'hover:bg-orange-200' }},
  { value: 'robotica',     label: 'Robótica',     color: 'category-robotica', colorHex: '#6366f1', tw: { background: 'bg-indigo-100', foreground: 'text-indigo-800', border: 'border-indigo-500', hoverBackground: 'hover:bg-indigo-200' }},
  { value: 'biblioteca',   label: 'Biblioteca',   color: 'category-biblioteca', colorHex: '#10b981', tw: { background: 'bg-emerald-100', foreground: 'text-emerald-800', border: 'border-emerald-500', hoverBackground: 'hover:bg-emerald-200' }},
  { value: 'nap',          label: 'NAP',          color: 'category-nap', colorHex: '#f43f5e', tw: { background: 'bg-rose-100', foreground: 'text-rose-800', border: 'border-rose-500', hoverBackground: 'hover:bg-rose-200' }},
] as const;
