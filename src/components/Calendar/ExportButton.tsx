import { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePdfExport } from '@/hooks/usePdfExport';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
}

export const ExportButton = ({ currentDate, events, selectedCategories }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportMonthlyCalendar, exportAnnualCalendar } = usePdfExport();
  const { toast } = useToast();

  const handleExportMonth = async () => {
    setIsExporting(true);
    try {
      await exportMonthlyCalendar(currentDate, events, selectedCategories);
      toast({
        title: "Exportação concluída",
        description: "Calendário mensal exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o calendário.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportYear = async () => {
    setIsExporting(true);
    try {
      await exportAnnualCalendar(currentDate.getFullYear(), events, selectedCategories);
      toast({
        title: "Exportação concluída",
        description: "Calendário anual exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o calendário.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isExporting}
          className="gap-2 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar PDF'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportMonth}>
          <FileText className="mr-2 h-4 w-4" />
          Calendário Mensal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportYear}>
          <Calendar className="mr-2 h-4 w-4" />
          Calendário Anual
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};