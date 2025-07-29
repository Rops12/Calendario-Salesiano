// src/hooks/usePdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  format,
  startOfMonth,
  getDay,
  getDaysInMonth,
  getYear,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useCategories } from '@/hooks/useCategories.tsx';
import { toast } from 'sonner';

// --- Constantes de Layout ---
const A4_WIDTH = 841.89;
const A4_HEIGHT = 595.28;
const MARGIN = 40;
const HEADER_HEIGHT = 100;
const FOOTER_HEIGHT = 50;
const CALENDAR_WIDTH = A4_WIDTH - 2 * MARGIN;
const CALENDAR_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;
const CELL_WIDTH = CALENDAR_WIDTH / 7;

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const { categories, getCategory } = useCategories();

  // --- Funções Auxiliares (comuns a ambos os formatos) ---
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const parseHsl = (hsl: string): [number, number, number] | null => {
    const match = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
    if (match) return [parseInt(match[1]), parseFloat(match[2]), parseFloat(match[3])];
    const singleValueMatch = hsl.match(/hsl\(([\d\s%.]+)\)/);
    if (singleValueMatch) {
      const values = singleValueMatch[1].split(' ').map(s => parseFloat(s));
      if (values.length === 3) return [values[0], values[1], values[2]];
    }
    return null;
  };

  const getCategoryColorHex = (categoryValue: string): string => {
    const category = getCategory(categoryValue);
    if (category?.color) {
      const hslValues = parseHsl(category.color);
      if (hslValues) return hslToHex(...hslValues);
    }
    return '#A1A1AA';
  };

  const addHeader = (doc: jsPDF, title: string, isAgenda: boolean = false) => {
    doc.setFontSize(24);
    doc.setTextColor('#18181B');
    doc.setFont('helvetica', 'bold');
    doc.text('Calendário Salesiano', isAgenda ? doc.internal.pageSize.getWidth() / 2 : MARGIN, 45, { align: isAgenda ? 'center' : 'left'});

    doc.setFontSize(16);
    doc.setTextColor('#71717A');
    doc.setFont('helvetica', 'normal');
    doc.text(title, isAgenda ? doc.internal.pageSize.getWidth() / 2 : MARGIN, 68, { align: isAgenda ? 'center' : 'left'});

    if (!isAgenda) {
      doc.setDrawColor('#E4E4E7');
      doc.setLineWidth(1);
      doc.line(MARGIN, 80, A4_WIDTH - MARGIN, 80);
    }
  };

  const addFooterWithLegend = (doc: jsPDF) => {
    const pageCount = doc.internal.getNumberOfPages();
    const activeCategories = categories.filter(c => c.isActive && selectedCategories.includes(c.value));
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      let legendX = MARGIN;
      const legendY = doc.internal.pageSize.getHeight() - 35;
      doc.setFontSize(7);
      
      activeCategories.forEach(category => {
        const color = getCategoryColorHex(category.value);
        const labelWidth = doc.getTextWidth(category.label) + 20;
        if (legendX + labelWidth > doc.internal.pageSize.getWidth() - MARGIN) return;
        doc.setFillColor(color);
        doc.roundedRect(legendX, legendY, 5, 5, 2.5, 2.5, 'F');
        doc.setTextColor('#3F3F46');
        doc.text(category.label, legendX + 8, legendY + 4);
        legendX += labelWidth;
      });
      
      doc.setFontSize(9);
      doc.setTextColor('#A1A1AA');
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, MARGIN, doc.internal.pageSize.getHeight() - 15);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - MARGIN, doc.internal.pageSize.getHeight() - 15, { align: 'right' });
    }
  };
  
  // --- LÓGICA 1: GERADOR DE CALENDÁRIO EM GRADE ---
  const generateCalendarPage = async (doc: jsPDF, date: Date) => {
    const eventsByDay: { [key: number]: CalendarEvent[] } = {};
    allEvents.filter(e => selectedCategories.includes(e.category)).forEach(event => {
      const interval = eachDayOfInterval({ start: parseISO(event.startDate), end: event.endDate ? parseISO(event.endDate) : parseISO(event.startDate) });
      interval.forEach(dayInInterval => {
        if (dayInInterval.getMonth() === date.getMonth() && dayInInterval.getFullYear() === date.getFullYear()) {
          const dayOfMonth = dayInInterval.getDate();
          if (!eventsByDay[dayOfMonth]) eventsByDay[dayOfMonth] = [];
          if (!eventsByDay[dayOfMonth].find(e => e.id === event.id)) eventsByDay[dayOfMonth].push(event);
        }
      });
    });

    const firstDayOfMonth = startOfMonth(date);
    const startingDayIndex = getDay(firstDayOfMonth);
    const daysInMonth = getDaysInMonth(date);
    const numWeeks = Math.ceil((startingDayIndex + daysInMonth) / 7);
    const CELL_HEIGHT = CALENDAR_HEIGHT / numWeeks;
    const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#71717A');
    WEEK_DAYS.forEach((day, i) => {
      doc.text(day, MARGIN + (i * CELL_WIDTH) + (CELL_WIDTH / 2), HEADER_HEIGHT - 12, { align: 'center' });
    });

    for (let i = 0; i < numWeeks * 7; i++) {
      const weekIndex = Math.floor(i / 7);
      const dayIndex = i % 7;
      const x = MARGIN + (dayIndex * CELL_WIDTH);
      const y = HEADER_HEIGHT + (weekIndex * CELL_HEIGHT);
      doc.setDrawColor('#E4E4E7');
      doc.rect(x, y, CELL_WIDTH, CELL_HEIGHT, 'S');

      const dayOfMonth = i - startingDayIndex + 1;
      if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor('#18181B');
        doc.text(String(dayOfMonth), x + 5, y + 14);

        const dayEvents = eventsByDay[dayOfMonth] || [];
        let eventYOffset = 30;
        const eventLineHeight = 10;
        const maxLinesPerEvent = 3;
        let eventsRenderedCount = 0;

        for (const event of dayEvents) {
          const clippedText = doc.splitTextToSize(event.title, CELL_WIDTH - 18);
          const linesForThisEvent = clippedText.slice(0, maxLinesPerEvent);
          const requiredHeight = (linesForThisEvent.length * eventLineHeight) + 2;
          
          if (eventYOffset + requiredHeight > CELL_HEIGHT - 12) {
            const remainingEvents = dayEvents.length - eventsRenderedCount;
            if (remainingEvents > 0) {
              doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor('#71717A');
              doc.text(`+ ${remainingEvents} mais...`, x + 5, y + CELL_HEIGHT - 6);
            }
            break;
          }
          
          doc.setFillColor(getCategoryColorHex(event.category));
          doc.roundedRect(x + 3, y + eventYOffset - 7, 3, 8, 1.5, 1.5, 'F');
          doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor('#3F3F46');
          doc.text(linesForThisEvent, x + 10, y + eventYOffset);
          eventYOffset += requiredHeight;
          eventsRenderedCount++;
        }
      }
    }
  };

  // --- LÓGICA 2: GERADOR DE AGENDA EM LISTA ---
  const generateAgendaPage = (doc: jsPDF, date: Date, yearOnly: boolean = false) => {
    const monthName = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    const title = yearOnly ? `Ano Completo de ${getYear(date)}` : monthName.charAt(0).toUpperCase() + monthName.slice(1);
    addHeader(doc, title, true);
    
    const monthEvents = allEvents
      .filter(event => {
        const eventDate = parseISO(event.startDate);
        const isInMonth = eventDate.getMonth() === date.getMonth() && eventDate.getFullYear() === date.getFullYear();
        const isInYear = eventDate.getFullYear() === date.getFullYear();
        return (yearOnly ? isInYear : isInMonth) && selectedCategories.includes(event.category);
      })
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
      
    if (monthEvents.length === 0 && !yearOnly) return;

    const tableBody = monthEvents.map(event => {
      const category = getCategory(event.category);
      const startDate = format(parseISO(event.startDate), 'dd/MM/yyyy');
      const endDate = event.endDate ? format(parseISO(event.endDate), 'dd/MM/yyyy') : startDate;
      const dateRange = startDate === endDate ? startDate : `${startDate} a ${endDate}`;
      return [{ content: dateRange }, { content: event.title }, { content: category?.label || event.category }];
    });
    
    autoTable(doc, {
      startY: 90,
      head: [['Data', 'Atividade', 'Segmento']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: '#1E3A8A', textColor: '#FFFFFF', fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 6, valign: 'middle' },
      columnStyles: { 0: { cellWidth: 100 }, 2: { cellWidth: 100 } },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.row.section === 'body') {
          const event = monthEvents[data.row.index];
          if (event) {
            data.cell.styles.fillColor = getCategoryColorHex(event.category);
            data.cell.styles.textColor = '#FFFFFF';
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
  };

  // --- FUNÇÕES DE EXPORTAÇÃO ---
  const exportMonthToCalendar = async (currentDate: Date) => {
    toast.info('Gerando PDF (Calendário)...');
    const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4' });
    const monthName = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
    await generateCalendarPage(doc, currentDate);
    addFooterWithLegend(doc);
    doc.save(`calendario-mensal-${format(currentDate, 'MM-yyyy')}.pdf`);
    toast.success('PDF (Calendário) gerado!');
  };

  const exportYearToCalendar = async (year: number) => {
    toast.info('Gerando PDF do ano (Calendário)...');
    const doc = new jsPDF('l', 'pt', 'a4');
    const months = eachMonthOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) });
    for (const [i, month] of months.entries()) {
      if (i > 0) doc.addPage();
      const monthName = format(month, "MMMM 'de' yyyy", { locale: ptBR });
      addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
      await generateCalendarPage(doc, month);
    }
    addFooterWithLegend(doc);
    doc.save(`calendario-anual-${year}.pdf`);
    toast.success('PDF do ano (Calendário) gerado!');
  };

  const exportMonthToAgenda = async (currentDate: Date) => {
    toast.info('Gerando PDF (Agenda)...');
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    generateAgendaPage(doc, currentDate);
    addFooterWithLegend(doc);
    doc.save(`agenda-mensal-${format(currentDate, 'MM-yyyy')}.pdf`);
    toast.success('PDF (Agenda) gerado!');
  };

  const exportYearToAgenda = async (year: number) => {
    toast.info('Gerando PDF do ano (Agenda)...');
    const doc = new jsPDF('p', 'pt', 'a4');
    const months = eachMonthOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) });
    let isFirstPage = true;
    months.forEach(month => {
      const monthEvents = allEvents.filter(event => parseISO(event.startDate).getMonth() === month.getMonth() && parseISO(event.startDate).getFullYear() === year && selectedCategories.includes(event.category));
      if (monthEvents.length > 0) {
        if (!isFirstPage) { (doc as any).lastAutoTable.finalY > 70 ? doc.addPage() : null; }
        generateAgendaPage(doc, month);
        isFirstPage = false;
      }
    });
    addFooterWithLegend(doc);
    doc.save(`agenda-anual-${year}.pdf`);
    toast.success('PDF do ano (Agenda) gerado!');
  };

  return { exportMonthToCalendar, exportYearToCalendar, exportMonthToAgenda, exportYearToAgenda };
};