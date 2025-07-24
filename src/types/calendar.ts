// src/types/calendar.ts
export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  category: string; // Simplificado para string
  eventType: EventType;
}

export interface CalendarEvent extends Omit<EventFormData, 'category'> {
  id: string;
  date: string; // Mantido para compatibilidade se necessário
  createdAt: string;
  updatedAt: string;
  category: string; // Simplificado para string
}

export type EventCategory = string; // Agora é apenas uma string, o valor virá do DB
export type EventType = 'normal' | 'feriado' | 'recesso' | 'evento';

// O ARRAY 'eventCategories' FOI REMOVIDO DESTE ARQUIVO.
// A fonte da verdade agora é o banco de dados via useCategories.
