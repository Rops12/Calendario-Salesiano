// src/hooks/usePdfExport.ts
import jsPDF from 'jspdf';
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

// --- Constantes de Layout para A4 Paisagem (em pontos) ---
const A4_WIDTH = 841.89;
const A4_HEIGHT = 595.28;
const MARGIN = 40;
const HEADER_HEIGHT = 85;
const FOOTER_HEIGHT = 30;
const CALENDAR_WIDTH = A4_WIDTH - 2 * MARGIN;
const CALENDAR_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;
const CELL_WIDTH = CALENDAR_WIDTH / 7;

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const { getCategory } = useCategories();

  // --- Funções de Cor (sem alterações) ---
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

  // --- Funções de Desenho no PDF (com alterações) ---
  const addHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(24);
    doc.setTextColor('#18181B');
    doc.setFont('helvetica', 'bold');
    doc.text('Calendário Salesiano', MARGIN, 45);

    doc.setFontSize(16);
    doc.setTextColor('#71717A');
    doc.setFont('helvetica', 'normal');
    doc.text(title, MARGIN, 65);
    
    doc.setDrawColor('#E4E4E7');
    doc.setLineWidth(1);
    doc.line(MARGIN, 75, A4_WIDTH - MARGIN, 75);
  };

  const addFooter = (doc: jsPDF) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor('#A1A1AA');
      doc.text(
        `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        MARGIN,
        A4_HEIGHT - 15
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        A4_WIDTH - MARGIN,
        A4_HEIGHT - 15,
        { align: 'right' }
      );
    }
  };
  
  const generateMonthPage = async (doc: jsPDF, date: Date) => {
    // 1. Agrupar eventos por dia
    const monthEvents = allEvents.filter(event => selectedCategories.includes(event.category));

    const eventsByDay: { [key: number]: CalendarEvent[] } = {};
    
    // MELHORIA: Lógica para eventos que duram vários dias
    monthEvents.forEach(event => {
      const startDate = parseISO(event.startDate + 'T00:00:00');
      const endDate = event.endDate ? parseISO(event.endDate + 'T00:00:00') : startDate;

      const interval = eachDayOfInterval({ start: startDate, end: endDate });
      
      interval.forEach(dayInInterval => {
        if (dayInInterval.getMonth() === date.getMonth() && dayInInterval.getFullYear() === date.getFullYear()) {
          const dayOfMonth = dayInInterval.getDate();
          if (!eventsByDay[dayOfMonth]) eventsByDay[dayOfMonth] = [];
          // Evita duplicar o mesmo evento no mesmo dia
          if (!eventsByDay[dayOfMonth].find(e => e.id === event.id)) {
            eventsByDay[dayOfMonth].push(event);
          }
        }
      });
    });

    // 2. Desenhar a grade e os eventos
    const firstDayOfMonth = startOfMonth(date);
    const startingDayIndex = getDay(firstDayOfMonth);
    const daysInMonth = getDaysInMonth(date);
    const numWeeks = Math.ceil((startingDayIndex + daysInMonth) / 7);
    const CELL_HEIGHT = CALENDAR_HEIGHT / numWeeks;
    const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // MELHORIA: Alinhamento central dos dias da semana
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#71717A');
    WEEK_DAYS.forEach((day, i) => {
      // Calcula o centro da célula para alinhar o texto
      const xPosition = MARGIN + (i * CELL_WIDTH) + (CELL_WIDTH / 2);
      doc.text(day, xPosition, HEADER_HEIGHT - 10, { align: 'center' });
    });

    // Desenha a grade e preenche com os dias e eventos
    for (let i = 0; i < numWeeks * 7; i++) {
      const weekIndex = Math.floor(i / 7);
      const dayIndex = i % 7;
      
      const x = MARGIN + (dayIndex * CELL_WIDTH);
      const y = HEADER_HEIGHT + (weekIndex * CELL_HEIGHT);
      
      // MELHORIA: Desenha a célula com cantos arredondados
      const cornerRadius = 4;
      doc.setDrawColor('#E4E4E7');
      doc.rect(x, y, CELL_WIDTH, CELL_HEIGHT, 'S'); // 'S' para apenas borda

      const dayOfMonth = i - startingDayIndex + 1;
      if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
        // Desenha o número do dia
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#18181B');
        doc.text(String(dayOfMonth), x + 5, y + 14);

        // Desenha os eventos do dia
        const dayEvents = eventsByDay[dayOfMonth] || [];
        let eventYOffset = 30;
        const eventLineHeight = 11;
        const maxLinesPerEvent = 1;
        
        dayEvents.forEach(event => {
          if (eventYOffset + eventLineHeight > CELL_HEIGHT - 5) return;

          const color = getCategoryColorHex(event.category);
          doc.setFillColor(color);
          
          // MELHORIA: Barra lateral com cantos arredondados
          doc.roundedRect(x + 3, y + eventYOffset - 7, 3, 8, 1.5, 1.5, 'F');
          
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#3F3F46');
          
          const clippedText = doc.splitTextToSize(event.title, CELL_WIDTH - 15);
          doc.text(clippedText.slice(0, maxLinesPerEvent), x + 10, y + eventYOffset);
          
          eventYOffset += eventLineHeight * maxLinesPerEvent + 2;
        });
      }
    }
  };

  // Funções de exportação (sem alterações na lógica principal)
  const exportMonthToPdf = async (currentDate: Date) => {
    toast.info('Gerando PDF do calendário, aguarde...');
    const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4' });

    const monthName = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
    await generateMonthPage(doc, currentDate);
    addFooter(doc);

    doc.save(`calendario-${format(currentDate, 'MMMM-yyyy')}.pdf`);
    toast.success('PDF do calendário gerado com sucesso!');
  };

  const exportFullYearToPdf = async (year: number) => {
    toast.info('Gerando PDF do ano completo. Isso pode demorar um momento...');
    const doc = new jsPDF('l', 'pt', 'a4');
    const months = eachMonthOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) });

    for (let i = 0; i < months.length; i++) {
      if (i > 0) doc.addPage();
      const monthName = format(months[i], "MMMM 'de' yyyy", { locale: ptBR });
      addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
      await generateMonthPage(doc, months[i]);
    }
    
    addFooter(doc);
    doc.save(`calendario-completo-${year}.pdf`);
    toast.success('PDF do ano completo gerado com sucesso!');
  };

  return { exportMonthToPdf, exportFullYearToPdf };
};