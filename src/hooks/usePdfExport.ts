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

  // --- Funções de Desenho ---
  const addHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(FONT_SIZES.title);
    doc.setTextColor(COLORS.headerBlue);
    doc.text("Calendário Salesiano", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    doc.setFontSize(FONT_SIZES.agendaSubtitle);
    doc.setTextColor(COLORS.darkGray);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
  };
  
  const addLegend = (doc: jsPDF, startY: number) => {
    let y = startY + 20; // Espaçamento após o conteúdo principal
    if (y > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      y = LAYOUT.pageMargin;
    }
    
    doc.setFontSize(FONT_SIZES.legendTitle);
    doc.setTextColor(COLORS.darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text("Legenda de Segmentos", LAYOUT.pageMargin, y);
    y += 20;

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

  const exportMonthToPdf = (currentDate: Date) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
    const { finalY, eventsForAgenda } = generateMonthAsCards(doc, currentDate);

    addLegend(doc, finalY);

    if (eventsForAgenda.some(day => day.events.length > 0)) {
        addDetailedAgenda(doc, eventsForAgenda);
    }

    doc.save(`calendario-mensal-${format(currentDate, 'yyyy-MM')}.pdf`);
  };

  const generateMonthAsCards = (doc: jsPDF, currentDate: Date): { finalY: number, eventsForAgenda: { date: Date, events: CalendarEvent[] }[] } => {
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
    
    return { finalY: y - LAYOUT.cardGap, eventsForAgenda: allMonthEvents.sort((a, b) => a.date.getTime() - b.date.getTime()) };
  };

  const exportWeekToPdf = (currentDate: Date) => {
    const doc = new jsPDF('l', 'pt', 'a4'); // Paisagem
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const weekEnd = endOfWeek(currentDate, { locale: ptBR });
    const weekTitle = `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`;
    addHeader(doc, `Semana de ${weekTitle}`);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const head = [weekDays.map(d => format(d, "EEEE, dd/MM", { locale: ptBR }))];
    const body = [weekDays.map(day => ({ date: day, events: getFilteredEventsForDate(day) }))];

    autoTable(doc, {
        startY: 80,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: COLORS.headerBlue, textColor: COLORS.white, fontStyle: 'bold', halign: 'center' },
        styles: { cellPadding: 4, valign: 'top', minCellHeight: doc.internal.pageSize.getHeight() - 100 },
        didDrawCell: (data) => {
            if (data.section === 'head') return;
            const dayData = data.cell.raw as { date: Date; events: CalendarEvent[] };
            if (!dayData?.date) return;
            
            let eventY = data.cell.y + 10;
            dayData.events.forEach(event => {
                const color = getCategoryColorHex(event.category);
                doc.setFillColor(color);
                doc.setTextColor(COLORS.white);
                doc.setFontSize(FONT_SIZES.eventTitle);
                
                const titleLines = doc.splitTextToSize(event.title, data.cell.width - 12);
                const eventCardHeight = titleLines.length * 10 + 6;

                doc.roundedRect(data.cell.x + 4, eventY, data.cell.width - 8, eventCardHeight, LAYOUT.eventRadius, LAYOUT.eventRadius, 'F');
                doc.text(titleLines, data.cell.x + 7, eventY + 9);
                eventY += eventCardHeight + 5;
            });
        },
        willDrawCell: (data) => { if (data.section === 'body') data.cell.text = []; }
    });
    
    doc.save(`calendario-semanal-${format(currentDate, 'yyyy-MM-dd')}.pdf`);
  };

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
