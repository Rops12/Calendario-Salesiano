// src/components/Calendar/CalendarHeader.tsx
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  LogOut,
  User,
  Link, // Importar o novo ícone se o ShareButton for interno
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViewSwitcher, CalendarView } from './ViewSwitcher';
import { ExportButton } from './ExportButton';
import { ShareButton } from './ShareButton'; // Importar o novo componente
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// ... (interface CalendarHeaderProps permanece a mesma) ...

interface CalendarHeaderProps {
    currentDate: Date;
    onNavigate: (direction: 'prev' | 'next' | 'today') => void;
    onDateSelect: (date: Date | undefined) => void;
    onNewEvent?: () => void;
    onSearch: (query: string) => void;
    searchQuery: string;
    currentView: CalendarView;
    onViewChange: (view: CalendarView) => void;
    events: CalendarEvent[];
    selectedCategories: EventCategory[];
    onAdminPanelOpen?: () => void;
    isAdmin?: boolean;
}

export function CalendarHeader({
  currentDate,
  onNavigate,
  onDateSelect,
  onNewEvent,
  onSearch,
  searchQuery,
  currentView,
  onViewChange,
  events,
  selectedCategories,
  onAdminPanelOpen,
  isAdmin,
}: CalendarHeaderProps) {
  const { user, logout } = useAuth();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const formatDateDisplay = (date: Date, view: CalendarView) => {
    switch (view) {
        case 'month': return format(date, "MMMM 'de' yyyy", { locale: ptBR });
        case 'week': {
            const start = startOfWeek(date, { locale: ptBR });
            const end = endOfWeek(date, { locale: ptBR });
            if (start.getMonth() === end.getMonth()) return `${format(start, 'd')} - ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
            if (start.getFullYear() !== end.getFullYear()) return `${format(start, "d 'de' MMM 'de' yyyy", { locale: ptBR })} - ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
            return `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
        }
        case 'agenda': return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
        default: return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setIsDatePickerOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Você saiu da sua conta.');
  };

  return (
    <header className="bg-[#4F46E5] shadow-lg sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-4 space-y-4">

        {/* --- CABEÇALHO PRINCIPAL (Desktop e Mobile) --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-7 w-7 text-white" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">Calendário Salesiano</h1>
              <p className="text-white/80 text-xs sm:text-sm">Colégio Salesiano Aracaju</p>
            </div>
          </div>
          
          {/* Desktop: Controles de Data e Visualização */}
          <div className="hidden md:flex items-center gap-4">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('today')} 
                className="text-white hover:bg-white/10 font-semibold border-b-2 border-white/50 hover:border-white transition-all rounded-none px-4"
              >
                Hoje
              </Button>
            <div className="flex items-center bg-white/10 rounded-full p-1">
                <Button variant="ghost" size="icon" onClick={() => onNavigate('prev')} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                    <h2 className="text-base font-semibold text-white text-center capitalize cursor-pointer hover:bg-white/10 rounded-md px-4 py-1.5 transition-colors whitespace-nowrap">
                        {formatDateDisplay(currentDate, currentView)}
                    </h2>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentDate} onSelect={handleDateSelect} initialFocus /></PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" onClick={() => onNavigate('next')} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
          </div>

          {/* Botões de Ação (Desktop e Mobile) */}
          <div className="flex items-center gap-2">
            {onNewEvent && (
              <Button onClick={onNewEvent} className="bg-white text-[#4F46E5] hover:bg-white/90 font-semibold">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nova Atividade</span>
              </Button>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-9 w-9">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && onAdminPanelOpen && <DropdownMenuItem onClick={onAdminPanelOpen}><Settings className="mr-2 h-4 w-4" /> Painel Admin</DropdownMenuItem>}
                  {user && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* --- CONTROLES SECUNDÁRIOS (Mobile) --- */}
        <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => onNavigate('prev')} className="text-white hover:bg-white/10 p-2 rounded-full"><ChevronLeft className="h-5 w-5" /></Button>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                        <h2 className="text-xl font-semibold text-white text-center capitalize cursor-pointer hover:bg-white/10 rounded-md px-3 py-1.5 transition-colors">{formatDateDisplay(currentDate, currentView)}</h2>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentDate} onSelect={handleDateSelect} initialFocus /></PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('next')} className="text-white hover:bg-white/10 p-2 rounded-full"><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <div className="flex justify-center items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => onNavigate('today')} className="text-white hover:bg-white/10 font-semibold border-b-2 border-white/50 hover:border-white transition-all rounded-none">Hoje</Button>
                <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
            </div>
        </div>

        {/* --- BARRA DE BUSCA E AÇÕES FINAIS (Responsivo) --- */}
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full h-10"
            />
          </div>
          <ShareButton /> {/* Botão de compartilhar adicionado */}
          <ExportButton currentDate={currentDate} events={events} selectedCategories={selectedCategories} />
        </div>
      </div>
    </header>
  );
}