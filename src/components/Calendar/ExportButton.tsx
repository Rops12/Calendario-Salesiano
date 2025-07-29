// src/components/Calendar/ExportButton.tsx
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, Calendar, ListChecks } from 'lucide-react';
import { usePdfExport } from '@/hooks/usePdfExport';
import { CalendarEvent, EventCategory } from '@/types/calendar';

interface ExportButtonProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
}

export function ExportButton({ currentDate, events, selectedCategories }: ExportButtonProps) {
  // O hook agora retorna quatro funções
  const { 
    exportMonthToCalendar, 
    exportYearToCalendar,
    exportMonthToAgenda,
    exportYearToAgenda
  } = usePdfExport(events, selectedCategories);

  const handleExportYear = (exportFunc: (year: number) => Promise<void>) => {
    const year = currentDate.getFullYear();
    exportFunc(year);
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar Mês Atual</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => exportMonthToCalendar(currentDate)}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>PDF (Calendário)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportMonthToAgenda(currentDate)}>
          <ListChecks className="mr-2 h-4 w-4" />
          <span>PDF (Agenda)</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Exportar Ano Completo</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExportYear(exportYearToCalendar)}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>PDF (Calendário)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportYear(exportYearToAgenda)}>
          <ListChecks className="mr-2 h-4 w-4" />
          <span>PDF (Agenda)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}