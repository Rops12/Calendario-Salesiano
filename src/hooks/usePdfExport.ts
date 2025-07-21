import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getYear, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';

// Adicionando uma interface para o AutoTable poder ser estendido
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const exportFullYearToPdf = (year: number) => {
    const doc = new jsPDF();
    const filteredEvents = allEvents.filter(event => selectedCategories.includes(event.category));

    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(year, i, 1);
      if (i > 0) {
        doc.addPage();
      }
      generateMonthPage(doc, currentDate, filteredEvents);
    }

    doc.save(`calendario-completo-${year}.pdf`);
  };
  
  const exportMonthToPdf = (currentDate: Date) => {
    const doc = new jsPDF();
    const filteredEvents = allEvents.filter(event => selectedCategories.includes(event.category));
    
    generateMonthPage(doc, currentDate, filteredEvents);
    
    const monthName = format(currentDate, 'MMMM', { locale: ptBR });
    const year = getYear(currentDate);
    doc.save(`calendario-${monthName}-${year}.pdf`);
  };

  const generateMonthPage = (doc: jsPDF, currentDate: Date, events: CalendarEvent[]) => {
    const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const getEventsForDate = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return events.filter(event => {
        const eventStartDate = event.startDate.split('T')[0];
        const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
        return dateStr >= eventStartDate && dateStr <= eventEndDate;
      });
    };
    
    const body = [];
    const firstDayOfMonth = getDay(start);
    let week: (string | number)[] = Array(firstDayOfMonth).fill('');
    
    days.forEach(day => {
      const dayEvents = getEventsForDate(day);
      let cellContent: string | number = day.getDate();
      if (dayEvents.length > 0) {
        const eventTitles = dayEvents.map(e => e.title).join('\n');
        cellContent = `${day.getDate()}\n\n${eventTitles}`;
      }
      week.push(cellContent);
      if (week.length === 7) {
        body.push(week);
        week = [];
      }
    });
    if (week.length > 0) {
      body.push(week.concat(Array(7 - week.length).fill('')));
    }

    doc.text(`Calendário - ${monthName}`, 14, 15);
    (doc as any).autoTable({
      head: [daysOfWeek],
      body: body,
      startY: 20,
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'top'
      },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255
      }
    });

    const eventsListStartY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Eventos de ${format(currentDate, 'MMMM yyyy', { locale: ptBR })}`, 14, eventsListStartY);
    
    let eventTextY = eventsListStartY + 5;
    const allMonthEvents = events.filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
    });

    allMonthEvents.forEach(event => {
        const eventDateStr = format(new Date(event.startDate), 'dd/MM/yyyy');
        doc.text(`${eventDateStr} - ${event.title}`, 14, eventTextY);
        eventTextY += 5;
    });
  };

  return { exportMonthToPdf, exportFullYearToPdf };
};
