import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getYear, getMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';

// Adicionando uma interface para o AutoTable poder ser estendido
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Helper para obter os dados de uma categoria (incluindo a cor)
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
      if (i > 0) {
        doc.addPage();
      }
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
    
    const startOfMonthDate = startOfMonth(currentDate);
    const endOfMonthDate = endOfMonth(currentDate);
    
    // Calcula o início e o fim da grade para incluir dias de outros meses
    const gridStartDate = new Date(startOfMonthDate);
    gridStartDate.setDate(gridStartDate.getDate() - getDay(startOfMonthDate));
    
    const gridEndDate = new Date(endOfMonthDate);
    gridEndDate.setDate(gridEndDate.getDate() + (6 - getDay(endOfMonthDate)));

    const days = eachDayOfInterval({ start: gridStartDate, end: gridEndDate });

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
    days.forEach((day, index) => {
      const dayData = {
        date: day,
        events: getEventsForDate(day),
        isCurrentMonth: getMonth(day) === getMonth(currentDate),
      };
      week.push(dayData);
      if ((index + 1) % 7 === 0) {
        body.push(week);
        week = [];
      }
    });

    doc.setFontSize(18);
    doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });

    doc.autoTable({
      startY: 100,
      head: [daysOfWeek],
      body: body,
      theme: 'grid',
      headStyles: {
        fillColor: [3, 105, 161], // Um azul escuro para o cabeçalho
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        cellPadding: 6,
        minCellHeight: 60, // Aumenta a altura da célula para caber os eventos
      },
      didDrawCell: (data) => {
        const dayData = data.cell.raw as { date: Date; events: CalendarEvent[]; isCurrentMonth: boolean };
        if (!dayData) return;

        const { date, events, isCurrentMonth } = dayData;
        const dayNumber = format(date, 'd');

        // Define a cor do número do dia (cinza para dias fora do mês)
        doc.setTextColor(isCurrentMonth ? '#111827' : '#9ca3af');
        doc.setFontSize(10);
        
        // Desenha o número do dia no canto superior esquerdo da célula
        doc.text(dayNumber, data.cell.x + 5, data.cell.y + 10);

        // --- A MÁGICA ACONTECE AQUI: DESENHANDO OS EVENTOS ---
        let eventY = data.cell.y + 20; // Posição inicial Y para a primeira pílula de evento
        const eventX = data.cell.x + 4;
        const eventWidth = data.cell.width - 8;
        const eventHeight = 14;
        const maxEvents = 3; // Limita o número de eventos por dia para não sobrecarregar

        events.slice(0, maxEvents).forEach((event, index) => {
          if (eventY + eventHeight > data.cell.y + data.cell.height) return; // Não desenha se passar da célula

          const categoryData = getCategoryData(event.category);
          const color = categoryData?.colorHex || '#d1d5db'; // Cor padrão cinza
          
          // Desenha a "pílula" colorida
          doc.setFillColor(color);
          doc.roundedRect(eventX, eventY, eventWidth, eventHeight, 3, 3, 'F');
          
          // Escreve o título do evento
          doc.setTextColor('#ffffff'); // Texto branco para melhor contraste
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          
          // Trunca o texto se for muito longo para caber na pílula
          const truncatedTitle = doc.splitTextToSize(event.title, eventWidth - 6);
          doc.text(truncatedTitle[0], eventX + 3, eventY + 9, {
            maxWidth: eventWidth - 6,
          });
          
          eventY += eventHeight + 4; // Move a posição Y para o próximo evento
        });

        if (events.length > maxEvents) {
          doc.setTextColor('#6b7280');
          doc.setFontSize(7);
          doc.text(`+${events.length - maxEvents} mais...`, eventX + 3, eventY + 9);
        }
      },
      // Formata o conteúdo da célula para não exibir o objeto [object Object]
      // Apenas o custom `didDrawCell` será responsável por renderizar
      willDrawCell: (data) => {
        data.cell.text = [''];
      }
    });
  };

  return { exportMonthToPdf, exportFullYearToPdf };
};
