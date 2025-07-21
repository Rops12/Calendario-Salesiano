import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';

// Remova a declaração de módulo daqui, pois não é mais necessária com a importação explícita.

const getCategoryData = (category: EventCategory) => {
  return eventCategories.find(cat => cat.value === category);
};

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const exportFullYearToPdf = (year: number) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const filteredEvents = allEvents.filter(event => selectedCategories.includes(event.category));
    doc.setFontSize(24);
    doc.text(`Calendário Salesiano - ${year}`, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(year, i, 1);
      if (i > 0) doc.addPage();
      generateMonthPage(doc, currentDate, filteredEvents);
    }
    doc.save(`calendario-completo-${year}.pdf`);
  };
  
  const exportMonthToPdf = (currentDate: Date) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const filteredEvents = allEvents.filter(event => selectedCategories.includes(event.category));
    generateMonthPage(doc, currentDate, filteredEvents);
    const monthName = format(currentDate, 'MMMM', { locale: ptBR });
    const year = getYear(currentDate);
    doc.save(`calendario-${monthName}-${year}.pdf`);
  };

  const generateMonthPage = (doc: jsPDF, currentDate: Date, events: CalendarEvent[]) => {
    const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    const gridStartDate = startOfMonth(currentDate);
    gridStartDate.setDate(gridStartDate.getDate() - getDay(gridStartDate));
    const gridEndDate = new Date(gridStartDate);
    gridEndDate.setDate(gridEndDate.getDate() + 41);
    
    const daysInGrid = eachDayOfInterval({ start: gridStartDate, end: gridEndDate });

    const getEventsForDate = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return events.filter(event => {
        const eventStartDate = event.startDate.split('T')[0];
        const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
        return dateStr >= eventStartDate && dateStr <= eventEndDate;
      }).sort((a, b) => a.title.localeCompare(b.title));
    };
    
    const body = [];
    let week: any[] = [];
    daysInGrid.forEach((day, index) => {
      const dayData = { date: day, events: getEventsForDate(day), isCurrentMonth: getMonth(day) === getMonth(currentDate) };
      week.push(dayData);
      if ((index + 1) % 7 === 0) { body.push(week); week = []; }
    });

    doc.setFontSize(18);
    doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });

    autoTable(doc, {
      startY: 100,
      head: [daysOfWeek],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [3, 105, 161], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      styles: { cellPadding: 0, minCellHeight: 65 },
      didDrawCell: (data) => {
        if (data.section === 'head') return;
        const dayData = data.cell.raw as { date: Date; events: CalendarEvent[]; isCurrentMonth: boolean };
        if (!dayData || !dayData.date) return;
        const { date, events, isCurrentMonth } = dayData;
        const dayNumber = format(date, 'd');
        if (!isCurrentMonth) {
            doc.setFillColor(243, 244, 246);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        }
        doc.setTextColor(isCurrentMonth ? '#111827' : '#9ca3af');
        doc.setFontSize(10);
        doc.text(dayNumber, data.cell.x + 5, data.cell.y + 12);
        let eventY = data.cell.y + 20;
        const eventX = data.cell.x + 4, eventWidth = data.cell.width - 8, eventHeight = 14, maxEvents = 3;
        events.slice(0, maxEvents).forEach((event) => {
          if (eventY + eventHeight > data.cell.y + data.cell.height - 5) return;
          const categoryData = getCategoryData(event.category);
          const color = categoryData?.colorHex || '#d1d5db';
          doc.setFillColor(color);
          doc.roundedRect(eventX, eventY, eventWidth, eventHeight, 3, 3, 'F');
          doc.setTextColor('#ffffff');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          const truncatedTitle = doc.splitTextToSize(event.title, eventWidth - 8);
          doc.text(truncatedTitle[0], eventX + 4, eventY + 9);
          eventY += eventHeight + 4;
        });
        if (events.length > maxEvents) {
          doc.setTextColor('#6b7280');
          doc.setFontSize(7);
          doc.text(`+${events.length - maxEvents} mais...`, eventX + 4, eventY + 9);
        }
      },
      willDrawCell: (data) => {
        if (data.section === 'body') data.cell.text = [];
      }
    });
  };

  return { exportMonthToPdf, exportFullYearToPdf };
};
