// src/hooks/usePdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, getDay, getYear, getMonth, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useCategories } from '@/hooks/useCategories.tsx';

// --- Constantes de Estilo para o PDF ---
const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F3F4F6', // bg-gray-100
  mediumGray: '#6B7280', // text-gray-500
  darkGray: '#111827', // text-gray-900
  headerBlue: '#4F46E5', // bg-[#4F46E5]
  todayBlue: '#DBEAFE', // bg-blue-100
  holidayRed: '#FEE2E2', // bg-red-100
  recessOrange: '#FFEDD5', // bg-orange-100
};

const FONT_SIZES = {
  title: 18,
  header: 10,
  dayNumber: 9,
  eventTitle: 7,
  eventCategory: 6,
  agendaTitle: 16,
  agendaSubtitle: 12,
  agendaText: 10,
};

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const { getCategory } = useCategories();

  // --- Funções Auxiliares de Cor ---
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  
  const parseHsl = (hsl: string): [number, number, number] | null => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
  };
  
  const getCategoryColorHex = (categoryValue: string): string => {
      const category = getCategory(categoryValue);
      if (category && category.color) {
        const hslValues = parseHsl(category.color);
        if (hslValues) {
          return hslToHex(...hslValues);
        }
      }
      return '#d1d5db'; // Cor de fallback
  };

  const addHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(FONT_SIZES.title);
    doc.setTextColor(COLORS.headerBlue);
    doc.text("Calendário Salesiano", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    doc.setFontSize(FONT_SIZES.agendaSubtitle);
    doc.setTextColor(COLORS.darkGray);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
  };

  const getFilteredEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allEvents.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    }).sort((a, b) => a.title.localeCompare(b.title));
  };

  // --- LÓGICA DE EXPORTAÇÃO (MÊS) ---
  const exportMonthToPdf = (currentDate: Date) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
    generateMonthTable(doc, currentDate);
    doc.save(`calendario-mensal-${format(currentDate, 'yyyy-MM')}.pdf`);
  };

  const generateMonthTable = (doc: jsPDF, currentDate: Date) => {
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const monthWeeks = eachWeekOfInterval({
      start: startOfMonth(currentDate),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    }, { weekStartsOn: 0 });

    const body = monthWeeks.map(weekStart => 
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        return {
          date,
          events: getFilteredEventsForDate(date),
          isCurrentMonth: getMonth(date) === getMonth(currentDate)
        };
      })
    );

    autoTable(doc, {
      startY: 80,
      head: [daysOfWeek],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: COLORS.headerBlue, textColor: COLORS.white, fontStyle: 'bold', halign: 'center' },
      styles: { cellPadding: 2, minCellHeight: 80, valign: 'top' },
      didDrawCell: (data) => {
        if (data.section === 'head') return;
        
        const dayData = data.cell.raw as { date: Date; events: CalendarEvent[]; isCurrentMonth: boolean };
        if (!dayData?.date) return;
        
        const { date, events, isCurrentMonth } = dayData;
        const dayNumber = format(date, 'd');
        const today = new Date();

        // Estilo de fundo da célula
        if (events.some(e => e.eventType === 'feriado')) doc.setFillColor(COLORS.holidayRed);
        else if (events.some(e => e.eventType === 'recesso')) doc.setFillColor(COLORS.recessOrange);
        else if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) doc.setFillColor(COLORS.todayBlue);
        else if (!isCurrentMonth) doc.setFillColor(COLORS.lightGray);
        else doc.setFillColor(COLORS.white);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        
        // Número do dia
        doc.setTextColor(isCurrentMonth ? COLORS.darkGray : COLORS.mediumGray);
        doc.setFontSize(FONT_SIZES.dayNumber);
        doc.text(dayNumber, data.cell.x + 4, data.cell.y + 10);

        // Eventos
        let eventY = data.cell.y + 18;
        const eventX = data.cell.x + 3, eventWidth = data.cell.width - 6, eventHeight = 12, maxEvents = 4;
        
        events.slice(0, maxEvents).forEach(event => {
          if (eventY + eventHeight > data.cell.y + data.cell.height - 5) return;
          const category = getCategory(event.category);
          const color = category ? getCategoryColorHex(category.value) : COLORS.mediumGray;
          
          doc.setDrawColor(color);
          doc.setLineWidth(1.5);
          doc.line(eventX, eventY, eventX, eventY + eventHeight);

          doc.setTextColor(COLORS.darkGray);
          doc.setFontSize(FONT_SIZES.eventTitle);
          doc.setFont('helvetica', 'bold');

          const truncatedTitle = doc.splitTextToSize(event.title, eventWidth - 8);
          doc.text(truncatedTitle[0], eventX + 4, eventY + 8);
          
          eventY += eventHeight + 2;
        });

        if (events.length > maxEvents) {
          doc.setTextColor(COLORS.mediumGray);
          doc.setFontSize(7);
          doc.text(`+${events.length - maxEvents} mais...`, eventX + 4, eventY + 8);
        }
      },
      willDrawCell: (data) => {
        if (data.section === 'body') data.cell.text = [];
      }
    });
  };

  // --- LÓGICA DE EXPORTAÇÃO (SEMANA) ---
  const exportWeekToPdf = (currentDate: Date) => {
    const doc = new jsPDF('l', 'pt', 'a4'); // Paisagem para melhor visualização
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const weekEnd = endOfWeek(currentDate, { locale: ptBR });
    const weekTitle = `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`;
    addHeader(doc, `Semana de ${weekTitle}`);
    generateWeekTable(doc, currentDate);
    doc.save(`calendario-semanal-${format(currentDate, 'yyyy-MM-dd')}.pdf`);
  };

  const generateWeekTable = (doc: jsPDF, currentDate: Date) => {
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const head = [weekDays.map(d => format(d, "EEEE, dd/MM", { locale: ptBR }))];
    const body = [weekDays.map(day => ({ date: day, events: getFilteredEventsForDate(day) }))];

    autoTable(doc, {
      startY: 80,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: COLORS.headerBlue, textColor: COLORS.white, fontStyle: 'bold', halign: 'center' },
      styles: { cellPadding: 2, valign: 'top' },
      didDrawCell: (data) => {
        if (data.section === 'head') return;
        const dayData = data.cell.raw as { date: Date; events: CalendarEvent[] };
        if (!dayData?.date) return;
        
        let eventY = data.cell.y + 10;
        dayData.events.forEach(event => {
          const category = getCategory(event.category);
          const color = category ? getCategoryColorHex(category.value) : COLORS.mediumGray;
          
          doc.setFillColor(color);
          doc.circle(data.cell.x + 8, eventY + 3, 3, 'F');
          
          doc.setTextColor(COLORS.darkGray);
          doc.setFontSize(FONT_SIZES.eventTitle);
          const titleLines = doc.splitTextToSize(event.title, data.cell.width - 20);
          doc.text(titleLines, data.cell.x + 15, eventY);
          eventY += (titleLines.length * FONT_SIZES.eventTitle) + 4;
        });
      },
      willDrawCell: (data) => {
        if (data.section === 'body') data.cell.text = [];
      }
    });
  };

  // --- LÓGICA DE EXPORTAÇÃO (AGENDA) ---
  const exportAgendaToPdf = (currentDate: Date) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const dayTitle = format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    addHeader(doc, dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1));
    
    const events = getFilteredEventsForDate(currentDate);
    let y = 100;

    if (events.length === 0) {
      doc.setFontSize(FONT_SIZES.agendaText);
      doc.setTextColor(COLORS.mediumGray);
      doc.text("Nenhum evento para este dia.", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    } else {
      events.forEach(event => {
        if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          y = 40;
        }

        const category = getCategory(event.category);
        const color = category ? getCategoryColorHex(category.value) : COLORS.mediumGray;
        
        doc.setFillColor(color);
        doc.rect(40, y, 5, 20, 'F');

        doc.setFontSize(FONT_SIZES.agendaTitle);
        doc.setTextColor(COLORS.darkGray);
        doc.setFont('helvetica', 'bold');
        doc.text(event.title, 55, y + 14);
        
        doc.setFontSize(FONT_SIZES.agendaText);
        doc.setTextColor(COLORS.mediumGray);
        doc.setFont('helvetica', 'normal');
        
        let eventMeta = `Categoria: ${category?.label || event.category}`;
        if (event.eventType !== 'normal') {
          eventMeta += ` (${event.eventType})`;
        }
        doc.text(eventMeta, 55, y + 28);
        y += 35;
        
        if (event.description) {
          const descLines = doc.splitTextToSize(event.description, doc.internal.pageSize.getWidth() - 100);
          doc.text(descLines, 55, y);
          y += (descLines.length * FONT_SIZES.agendaText) + 15;
        }

        y += 10;
      });
    }

    doc.save(`agenda-${format(currentDate, 'yyyy-MM-dd')}.pdf`);
  };

  return { exportMonthToPdf, exportWeekToPdf, exportAgendaToPdf };
};
