import { useState } from 'react';
import { Download, Loader2, Calendar, Check } from 'lucide-react';
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
    await exportMonthToPdf(currentDate); // Adicionado 'await'
    setIsExporting(false);
  };

  const handleExportYear = async () => {
    setIsExporting(true);
    const year = getYear(currentDate);
    await exportFullYearToPdf(year); // Adicionado 'await'
    setIsExporting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-white border-white/20 bg-white/10 hover:bg-white/20">
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
