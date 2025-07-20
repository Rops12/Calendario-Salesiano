import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfYear, endOfYear, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getCategoryName = (category: EventCategory): string => {
  const categoryMap: Record<EventCategory, string> = {
    geral: 'Geral',
    infantil: 'Ensino Infantil',
    fundamental1: 'Ensino Fundamental 1',
    fundamental2: 'Ensino Fundamental 2',
    medio: 'Ensino Médio',
    pastoral: 'Pastoral',
    esportes: 'Esportes',
    robotica: 'Robótica',
    biblioteca: 'Biblioteca',
    nap: 'NAP'
  };
  return categoryMap[category] || category;
};

export const usePdfExport = () => {
  const exportMonthlyCalendar = async (
    date: Date,
    events: CalendarEvent[],
    selectedCategories: EventCategory[]
  ) => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Filter events for the month and selected categories
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= monthStart && 
             eventDate <= monthEnd && 
             selectedCategories.includes(event.category);
    });

    // Title
    const monthYear = format(date, 'MMMM yyyy', { locale: ptBR });
    pdf.setFontSize(20);
    pdf.text(`Calendário - ${monthYear}`, pageWidth / 2, 20, { align: 'center' });

    // Calendar grid
    const startDate = monthStart;
    const endDate = monthEnd;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const cellWidth = (pageWidth - 40) / 7;
    const cellHeight = 25;
    const startX = 20;
    const startY = 40;

    // Days of week header
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    pdf.setFontSize(12);
    daysOfWeek.forEach((day, index) => {
      pdf.text(day, startX + (index * cellWidth) + cellWidth/2, startY, { align: 'center' });
    });

    // Calendar days
    let currentRow = 0;
    let currentCol = getDay(startDate);
    
    days.forEach((day, index) => {
      const x = startX + (currentCol * cellWidth);
      const y = startY + 10 + (currentRow * cellHeight);
      
      // Draw cell border
      pdf.rect(x, y, cellWidth, cellHeight);
      
      // Day number
      pdf.setFontSize(10);
      pdf.text(format(day, 'd'), x + 5, y + 15);
      
      // Events for this day
      const dayEvents = filteredEvents.filter(event => 
        format(new Date(event.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      // Highlight holidays and recesses with background color
      const hasHolidayOrRecess = dayEvents.some(event => 
        event.eventType === 'feriado' || event.eventType === 'recesso'
      );
      
      if (hasHolidayOrRecess) {
        const holidayEvent = dayEvents.find(event => event.eventType === 'feriado');
        const recessEvent = dayEvents.find(event => event.eventType === 'recesso');
        
        if (holidayEvent) {
          pdf.setFillColor(255, 230, 230); // Light red for holidays
        } else if (recessEvent) {
          pdf.setFillColor(255, 245, 230); // Light orange for recess
        }
        pdf.rect(x, y, cellWidth, cellHeight, 'F');
      }
      
      dayEvents.slice(0, 2).forEach((event, eventIndex) => {
        pdf.setFontSize(8);
        const text = event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title;
        pdf.text(text, x + 2, y + 20 + (eventIndex * 8));
      });
      
      if (dayEvents.length > 2) {
        pdf.setFontSize(7);
        pdf.text(`+${dayEvents.length - 2} mais`, x + 2, y + 20 + (2 * 8));
      }
      
      currentCol++;
      if (currentCol === 7) {
        currentCol = 0;
        currentRow++;
      }
    });

    // Events list
    if (filteredEvents.length > 0) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text(`Eventos de ${monthYear}`, 20, 20);
      
      let yPosition = 40;
      filteredEvents.forEach((event) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        const categoryName = getCategoryName(event.category);
        pdf.text(`${format(new Date(event.startDate), 'dd/MM/yyyy')} - ${event.title} (${categoryName})`, 20, yPosition);
        yPosition += 8;
        
        if (event.description) {
          pdf.setFontSize(10);
          const lines = pdf.splitTextToSize(event.description, pageWidth - 40);
          lines.forEach((line: string) => {
            pdf.text(line, 25, yPosition);
            yPosition += 6;
          });
        }
        yPosition += 5;
      });
    }

    pdf.save(`calendario-${format(date, 'yyyy-MM')}.pdf`);
  };

  const exportAnnualCalendar = async (
    year: number,
    events: CalendarEvent[],
    selectedCategories: EventCategory[]
  ) => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Filter events for the year and selected categories
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= yearStart && 
             eventDate <= yearEnd && 
             selectedCategories.includes(event.category);
    });

    // Create 12 monthly pages (one page per month)
    const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
    
    months.forEach((month, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      
      // Month title
      const monthYear = format(month, 'MMMM yyyy', { locale: ptBR });
      pdf.setFontSize(20);
      pdf.text(`Calendário - ${monthYear}`, pageWidth / 2, 20, { align: 'center' });

      // Calendar grid - same as monthly export but full page
      const startDate = startOfMonth(month);
      const endDate = endOfMonth(month);
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      const cellWidth = (pageWidth - 40) / 7;
      const cellHeight = 25;
      const startX = 20;
      const startY = 40;

      // Days of week header
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      pdf.setFontSize(12);
      daysOfWeek.forEach((day, dayIndex) => {
        pdf.text(day, startX + (dayIndex * cellWidth) + cellWidth/2, startY, { align: 'center' });
      });

      // Calendar days
      let currentRow = 0;
      let currentCol = getDay(startDate);
      
      days.forEach((day) => {
        const x = startX + (currentCol * cellWidth);
        const y = startY + 10 + (currentRow * cellHeight);
        
        // Get day events for highlighting
        const dayEvents = filteredEvents.filter(event => 
          format(new Date(event.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        
        // Highlight holidays and recesses with background color
        const hasHolidayOrRecess = dayEvents.some(event => 
          event.eventType === 'feriado' || event.eventType === 'recesso'
        );
        
        if (hasHolidayOrRecess) {
          const holidayEvent = dayEvents.find(event => event.eventType === 'feriado');
          const recessEvent = dayEvents.find(event => event.eventType === 'recesso');
          
          if (holidayEvent) {
            pdf.setFillColor(255, 230, 230); // Light red for holidays
          } else if (recessEvent) {
            pdf.setFillColor(255, 245, 230); // Light orange for recess
          }
          pdf.rect(x, y, cellWidth, cellHeight, 'F');
        }
        
        // Draw cell border
        pdf.rect(x, y, cellWidth, cellHeight);
        
        // Day number
        pdf.setFontSize(10);
        pdf.text(format(day, 'd'), x + 5, y + 15);
        
        // Events for this day
        dayEvents.slice(0, 2).forEach((event, eventIndex) => {
          pdf.setFontSize(8);
          const text = event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title;
          pdf.text(text, x + 2, y + 20 + (eventIndex * 8));
        });
        
        if (dayEvents.length > 2) {
          pdf.setFontSize(7);
          pdf.text(`+${dayEvents.length - 2} mais`, x + 2, y + 20 + (2 * 8));
        }
        
        currentCol++;
        if (currentCol === 7) {
          currentCol = 0;
          currentRow++;
        }
      });
      
      // Events list for this month
      const monthEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= startOfMonth(month) && eventDate <= endOfMonth(month);
      });
      
      if (monthEvents.length > 0) {
        let yPosition = startY + 200; // Below calendar
        
        pdf.setFontSize(14);
        pdf.text(`Eventos de ${format(month, 'MMMM yyyy', { locale: ptBR })}`, 20, yPosition);
        yPosition += 15;
        
        monthEvents.forEach((event) => {
          if (yPosition > pageHeight - 30) {
            // This event would overflow, skip for now or add logic to continue on next page
            return;
          }
          
          pdf.setFontSize(10);
          const categoryName = getCategoryName(event.category);
          pdf.text(`${format(new Date(event.startDate), 'dd/MM/yyyy')} - ${event.title} (${categoryName})`, 20, yPosition);
          yPosition += 8;
          
          if (event.description) {
            pdf.setFontSize(9);
            const lines = pdf.splitTextToSize(event.description, pageWidth - 40);
            lines.slice(0, 2).forEach((line: string) => { // Limit to 2 lines to avoid overflow
              pdf.text(line, 25, yPosition);
              yPosition += 6;
            });
          }
          yPosition += 3;
        });
      }
    });

    // Annual events summary
    if (filteredEvents.length > 0) {
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.text(`Resumo de Eventos ${year}`, 20, 20);
      
      let yPosition = 40;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      filteredEvents.forEach((event) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        pdf.text(`${format(new Date(event.startDate), 'dd/MM/yyyy')} - ${event.title}`, 20, yPosition);
        yPosition += 8;
      });
    }

    pdf.save(`calendario-${year}.pdf`);
  };

  return {
    exportMonthlyCalendar,
    exportAnnualCalendar
  };
};