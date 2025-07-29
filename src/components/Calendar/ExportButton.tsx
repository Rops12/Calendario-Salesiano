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
        {/* AJUSTE 5.1: Botão se adapta ao tamanho da tela */}
        <Button
          variant="ghost"
          size="icon" // Tamanho de ícone por padrão
          className="text-white hover:bg-white/10 rounded-full flex-shrink-0 h-10 w-10 sm:w-auto sm:px-3 sm:py-2"
          title="Exportar Calendário"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Exportar</span>
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