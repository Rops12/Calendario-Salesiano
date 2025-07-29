// src/components/Calendar/ExportButton.tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { usePdfExport } from '@/hooks/usePdfExport';
import { CalendarEvent, EventCategory } from '@/types/calendar';

interface ExportButtonProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
}

export function ExportButton({ currentDate, events, selectedCategories }: ExportButtonProps) {
  const { exportMonthToPdf, exportFullYearToPdf } = usePdfExport(events, selectedCategories);

  const handleExportMonth = async () => {
    await exportMonthToPdf(currentDate);
  };

  const handleExportYear = async () => {
    const year = currentDate.getFullYear();
    await exportFullYearToPdf(year);
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
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportMonth}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar Mês (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportYear}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Ano Completo (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}