import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePdfExport } from '@/hooks/usePdfExport';
import { CalendarEvent, EventCategory } from '@/types/calendar';

interface ExportButtonProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
}

export function ExportButton({ currentDate, events, selectedCategories }: ExportButtonProps) {
  const { exportMonthToPdf, exportFullYearToPdf } = usePdfExport(events, selectedCategories);

  const handleExportMonth = () => {
    exportMonthToPdf(currentDate);
  };

  const handleExportYear = () => {
    const year = currentDate.getFullYear();
    exportFullYearToPdf(year);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          title="Exportar Calendário"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportMonth}>
          Exportar Mês Atual (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportYear}>
          Exportar Ano Completo (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
