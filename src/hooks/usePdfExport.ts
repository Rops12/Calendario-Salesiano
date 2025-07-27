// src/hooks/usePdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, getDay, getYear, getMonth, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useCategories } from '@/hooks/useCategories.tsx';

// --- Constantes de Estilo Otimizadas para o PDF ---
const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F9FAFB', // bg-gray-50
  mediumGray: '#9CA3AF', // text-gray-400
  darkGray: '#374151', // text-gray-700
  headerBlue: '#4F46E5', // bg-[#4F46E5]
  todayBlueBg: '#EFF6FF', // bg-blue-50
  todayBlueBorder: '#BFDBFE', // border-blue-200
  holidayRedBg: '#FEF2F2', // bg-red-50
  holidayRedBorder: '#FECACA', // border-red-200
  recessOrangeBg: '#FFF7ED', // bg-orange-50
  recessOrangeBorder: '#FED7AA', // border-orange-200
  cardBorder: '#E5E7EB', // border-gray-200
};

const FONT_SIZES = {
  title: 20,
  header: 10,
  dayNumber: 10,
  eventTitle: 7.5,
  agendaTitle: 18,
  agendaSubtitle: 12,
  agendaText: 10,
  legendTitle: 12,
  legendText: 9,
};

const LAYOUT = {
  pageMargin: 30,
  cardGap: 8,
  cardRadius: 8,
  eventRadius: 4,
};

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const { categories, getCategory } = useCategories();

  // --- Funções Auxiliares de Cor (sem alterações) ---
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

  // --- Funções de Desenho ---
  const addHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(FONT_SIZES.title);
    doc.setTextColor(COLORS.headerBlue);
    doc.text("Calendário Salesiano", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    doc.setFontSize(FONT_SIZES.agendaSubtitle);
    doc.setTextColor(COLORS.darkGray);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
  };
  
  const addLegend = (doc: jsPDF) => {
    let y = doc.autoTable.previous.finalY + 30;
    if (y > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      y = LAYOUT.pageMargin;
    }
    
    doc.setFontSize(FONT_SIZES.legendTitle);
    doc.setTextColor(COLORS.darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text("Legenda de Segmentos", LAYOUT.pageMargin, y);
    y += 15;

    const activeCategories = categories.filter(cat => cat.isActive && selectedCategories.includes(cat.value));
    let x = LAYOUT.pageMargin;
    const itemWidth = 120;

    activeCategories.forEach((category) => {
      if (x + itemWidth > doc.internal.pageSize.getWidth() - LAYOUT.pageMargin) {
        x = LAYOUT.pageMargin;
        y += 20;
      }
      
      doc.setFillColor(getCategoryColorHex(category.value));
      doc.rect(x, y, 10, 10, 'F');
      
      doc.setFontSize(FONT_SIZES.legendText);
      doc.setTextColor(COLORS.darkGray);
      doc.setFont('helvetica', 'normal');
      doc.text(category.label, x + 15, y + 8);
      
      x += itemWidth;
    });
  };

  const addDetailedAgenda = (doc: jsPDF, monthEvents: { date: Date, events: CalendarEvent[] }[]) => {
    doc.addPage();
    addHeader(doc, "Agenda Detalhada do Mês");
    let y = 100;
  
    monthEvents.forEach(({ date, events }) => {
      if (events.length === 0) return;
  
      if (y > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        y = LAYOUT.pageMargin;
      }
  
      const dayTitle = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
      doc.setFontSize(FONT_SIZES.agendaSubtitle);
      doc.setTextColor(COLORS.headerBlue);
      doc.setFont('helvetica', 'bold');
      doc.text(dayTitle, LAYOUT.pageMargin, y);
      y += 20;
  
      events.forEach(event => {
        if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          y = LAYOUT.pageMargin;
        }
        
        const category = getCategory(event.category);
        const color = category ? getCategoryColorHex(category.value) : COLORS.mediumGray;
        
        doc.setFillColor(color);
        doc.rect(LAYOUT.pageMargin, y, 5, 15, 'F');
  
        doc.setFontSize(FONT_SIZES.agendaText);
        doc.setTextColor(COLORS.darkGray);
        doc.setFont('helvetica', 'bold');
        doc.text(event.title, LAYOUT.pageMargin + 10, y + 10);
        
        if (event.description) {
          y += 15;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(COLORS.mediumGray);
          const descLines = doc.splitTextToSize(event.description, doc.internal.pageSize.getWidth() - (LAYOUT.pageMargin * 2) - 10);
          doc.text(descLines, LAYOUT.pageMargin + 10, y);
          y += (descLines.length * FONT_SIZES.agendaText);
        }
        y += 15;
      });
    });
  };

  const getFilteredEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allEvents.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    }).sort((a, b) => a.title.localeCompare(b.title));
  };

  // --- Otimização Visual: Exportação de Mês com Cards ---
  const exportMonthToPdf = (currentDate: Date) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
    const eventsForAgenda = generateMonthAsCards(doc, currentDate);

    addLegend(doc);

    if (eventsForAgenda.some(day => day.events.length > 0)) {
        addDetailedAgenda(doc, eventsForAgenda);
    }

    doc.save(`calendario-mensal-${format(currentDate, 'yyyy-MM')}.pdf`);
  };

  const generateMonthAsCards = (doc: jsPDF, currentDate: Date): { date: Date, events: CalendarEvent[] }[] => {
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (LAYOUT.pageMargin * 2);
    const cardWidth = (contentWidth - (LAYOUT.cardGap * 6)) / 7;
    const cardHeight = 100;
    let y = 110;
    
    const allMonthEvents: { date: Date, events: CalendarEvent[] }[] = [];

    doc.setFontSize(FONT_SIZES.header);
    doc.setTextColor(COLORS.darkGray);
    doc.setFont('helvetica', 'bold');
    daysOfWeek.forEach((day, i) => {
        doc.text(day, LAYOUT.pageMargin + i * (cardWidth + LAYOUT.cardGap) + cardWidth / 2, y - 15, { align: 'center' });
    });

    const monthWeeks = eachWeekOfInterval({
        start: startOfMonth(currentDate),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    }, { weekStartsOn: 0 });

    monthWeeks.forEach(weekStart => {
        let x = LAYOUT.pageMargin;
        for (let i = 0; i < 7; i++) {
            const date = addDays(weekStart, i);
            const events = getFilteredEventsForDate(date);
            const isCurrentMonth = getMonth(date) === getMonth(currentDate);
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            if (isCurrentMonth) {
                allMonthEvents.push({ date, events });
            }
            
            let bgColor = COLORS.white;
            let borderColor = COLORS.cardBorder;
            if (events.some(e => e.eventType === 'feriado')) { bgColor = COLORS.holidayRedBg; borderColor = COLORS.holidayRedBorder; }
            else if (events.some(e => e.eventType === 'recesso')) { bgColor = COLORS.recessOrangeBg; borderColor = COLORS.recessOrangeBorder; }
            else if (isToday) { bgColor = COLORS.todayBlueBg; borderColor = COLORS.todayBlueBorder; }
            else if (!isCurrentMonth) { bgColor = COLORS.lightGray; }

            doc.setDrawColor(borderColor);
            doc.setFillColor(bgColor);
            doc.roundedRect(x, y, cardWidth, cardHeight, LAYOUT.cardRadius, LAYOUT.cardRadius, 'FD');

            doc.setTextColor(isCurrentMonth ? COLORS.darkGray : COLORS.mediumGray);
            doc.setFontSize(FONT_SIZES.dayNumber);
            doc.setFont('helvetica', 'bold');
            doc.text(format(date, 'd'), x + 6, y + 12);
            
            let eventY = y + 22;
            const maxEvents = 4;
            events.slice(0, maxEvents).forEach(event => {
                if (eventY > y + cardHeight - 15) return;
                
                const color = getCategoryColorHex(event.category);
                doc.setFillColor(color);
                doc.setTextColor(COLORS.white);
                doc.setFontSize(FONT_SIZES.eventTitle);
                doc.setFont('helvetica', 'bold');

                const title = doc.splitTextToSize(event.title, cardWidth - 12);
                const eventCardHeight = title.length * 10 + 4;

                doc.roundedRect(x + 4, eventY, cardWidth - 8, eventCardHeight, LAYOUT.eventRadius, LAYOUT.eventRadius, 'F');
                doc.text(title, x + 6, eventY + 8);
                
                eventY += eventCardHeight + 3;
            });
            
            if (events.length > maxEvents) {
                doc.setTextColor(COLORS.mediumGray);
                doc.setFontSize(7);
                doc.text(`(...)`, x + 6, eventY + 8);
            }

            x += cardWidth + LAYOUT.cardGap;
        }
        y += cardHeight + LAYOUT.cardGap;
    });
    
    // Simula a posição final da tabela para a legenda poder ser adicionada depois
    // @ts-ignore
    doc.autoTable.previous = { finalY: y - LAYOUT.cardGap };
    return allMonthEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // --- EXPORTAÇÃO (SEMANA E AGENDA) ---
  const exportWeekToPdf = (currentDate: Date) => { /* ... implementação anterior ... */ };
  const exportAgendaToPdf = (currentDate: Date) => { /* ... implementação anterior ... */ };

  return { exportMonthToPdf, exportWeekToPdf, exportAgendaToPdf };
};
