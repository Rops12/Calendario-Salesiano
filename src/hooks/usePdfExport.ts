// src/hooks/usePdfExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useCategories } from '@/hooks/useCategories.tsx';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const usePdfExport = (
  allEvents: CalendarEvent[],
  selectedCategories: EventCategory[]
) => {
  const { getCategory } = useCategories();

  // Função para converter HSL para Hex, necessário para o jsPDF
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
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    const singleValueMatch = hsl.match(/hsl\(([\d\s%]+)\)/);
    if (singleValueMatch) {
        const values = singleValueMatch[1].split(' ').map(s => parseFloat(s));
        if (values.length === 3) {
            return [values[0], values[1], values[2]];
        }
    }
    return null;
  };

  const getCategoryColorHex = (categoryValue: string): string => {
    const category = getCategory(categoryValue);
    if (category?.color) {
      const hslValues = parseHsl(category.color);
      if (hslValues) {
        return hslToHex(...hslValues);
      }
    }
    return '#D1D5DB'; // Cor de fallback (cinza)
  };

  // Função para criar o cabeçalho de cada página do PDF
  const addHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(22);
    doc.setTextColor('#1E3A8A'); // Azul Salesiano
    doc.text('Calendário Salesiano', doc.internal.pageSize.getWidth() / 2, 45, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor('#4B5563');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 70, { align: 'center' });
  };

  // Função para criar o rodapé
  const addFooter = (doc: jsPDF) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor('#6B7280');
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'center' }
      );
    }
  };

  const generatePdfForMonth = async (doc: jsPDF, date: Date, events: CalendarEvent[]) => {
    const monthName = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    addHeader(doc, monthName.charAt(0).toUpperCase() + monthName.slice(1));
    
    const tableBody = events.map(event => {
      const category = getCategory(event.category);
      const startDate = format(new Date(event.startDate + 'T00:00:00'), 'dd/MM/yyyy');
      const endDate = event.endDate ? format(new Date(event.endDate + 'T00:00:00'), 'dd/MM/yyyy') : startDate;
      const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
      
      return [
        { content: dateRange, styles: { fontStyle: 'bold' } },
        { content: event.title },
        { content: category?.label || event.category }
      ];
    });

    autoTable(doc, {
      startY: 100,
      head: [['Data', 'Evento', 'Segmento']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: '#2563EB', // Azul primário
        textColor: '#FFFFFF',
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 6,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 110 },
        2: { cellWidth: 100 },
      },
      didParseCell: (data) => {
        // Colore a célula do segmento de acordo com a categoria
        if (data.column.index === 2 && data.row.section === 'body') {
            const event = events[data.row.index];
            if (event) {
                data.cell.styles.fillColor = getCategoryColorHex(event.category);
                data.cell.styles.textColor = '#FFFFFF';
                data.cell.styles.fontStyle = 'bold';
            }
        }
      }
    });
  };

  const exportMonthToPdf = async (currentDate: Date) => {
    toast.info('Gerando PDF do mês, por favor aguarde...');
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });
    
    const monthEvents = allEvents.filter(event => {
      const eventDate = new Date(event.startDate + 'T00:00:00');
      return eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear() &&
             selectedCategories.includes(event.category);
    });
    
    await generatePdfForMonth(doc, currentDate, monthEvents);
    addFooter(doc);

    const monthName = format(currentDate, 'MMMM-yyyy', { locale: ptBR });
    doc.save(`calendario-${monthName}.pdf`);
    toast.success('PDF do mês gerado com sucesso!');
  };

  const exportFullYearToPdf = async (year: number) => {
    toast.info('Gerando PDF do ano completo. Isso pode levar um momento...');
    const doc = new jsPDF('p', 'pt', 'a4');
    
    for (let month = 0; month < 12; month++) {
      if (month > 0) {
        doc.addPage();
      }
      
      const monthEvents = allEvents.filter(event => {
        const eventDate = new Date(event.startDate + 'T00:00:00');
        return eventDate.getMonth() === month &&
               eventDate.getFullYear() === year &&
               selectedCategories.includes(event.category);
      });
      
      await generatePdfForMonth(doc, new Date(year, month, 1), monthEvents);
    }
    
    addFooter(doc);
    doc.save(`calendario-completo-${year}.pdf`);
    toast.success('PDF do ano completo gerado com sucesso!');
  };

  return { exportMonthToPdf, exportFullYearToPdf };
};