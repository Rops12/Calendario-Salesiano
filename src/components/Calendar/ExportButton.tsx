import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, CalendarDays, View, BookText } from 'lucide-react'; // Ícone corrigido aqui
import { usePdfExport } from '@/hooks/usePdfExport';
import { CalendarEvent, EventCategory } from '@/types/calendar';

interface ExportButtonProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
}

export function ExportButton({ currentDate, events, selectedCategories }: ExportButtonProps) {
  const { exportMonthToPdf, exportWeekToPdf, exportAgendaToPdf } = usePdfExport(events, selectedCategories);

  const handleExportMonth = () => {
    exportMonthToPdf(currentDate);
  };

  const handleExportWeek = () => {
    exportWeekToPdf(currentDate);
  };

  const handleExportAgenda = () => {
    exportAgendaToPdf(currentDate);
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
        <DropdownMenuItem onClick={handleExportMonth} className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>Exportar Mês (PDF)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportWeek} className="flex items-center gap-2">
          <View className="h-4 w-4" /> {/* Ícone corrigido aqui */}
          <span>Exportar Semana (PDF)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportAgenda} className="flex items-center gap-2">
          <BookText className="h-4 w-4" />
          <span>Exportar Dia/Agenda (PDF)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
