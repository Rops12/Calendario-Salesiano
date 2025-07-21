import { useState } from 'react';
import { Calendar, Check, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePdfExport } from '@/hooks/usePdfExport';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { getYear } from 'date-fns';

interface ExportButtonProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
}

export function ExportButton({ currentDate, events, selectedCategories }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { exportMonthToPdf, exportFullYearToPdf } = usePdfExport(events, selectedCategories);

  const handleExportMonth = async () => {
    setIsExporting(true);
    await exportMonthToPdf(currentDate);
    setIsExporting(false);
  };

  const handleExportYear = async () => {
    setIsExporting(true);
    const year = getYear(currentDate);
    await exportFullYearToPdf(year);
    setIsExporting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportMonth} disabled={isExporting}>
          <Calendar className="h-4 w-4 mr-2" />
          Exportar Mês Atual
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportYear} disabled={isExporting}>
          <Check className="h-4 w-4 mr-2" />
          Exportar Ano Completo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
