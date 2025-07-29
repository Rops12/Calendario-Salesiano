import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  LogOut,
  User,
  Download,
  Link as LinkIcon, // Renomeado para evitar conflito de nome
  MoreVertical,   // Ícone adicionado para o menu mobile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViewSwitcher, CalendarView } from './ViewSwitcher';
import { ExportButton } from './ExportButton';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { toast } from 'sonner'; // Usando o sonner para toasts mais modernos
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
      case 'month':
        return format(date, "MMMM 'de' yyyy", { locale: ptBR });
      case 'week': {
        const start = startOfWeek(date, { locale: ptBR, weekStartsOn: 0 });
        const end = endOfWeek(date, { locale: ptBR, weekStartsOn: 0 });
        if (start.getMonth() === end.getMonth()) {
          return `${format(start, 'd')} - ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
        }
        if (start.getFullYear() !== end.getFullYear()) {
          return `${format(start, "d 'de' MMM 'de' yyyy", { locale: ptBR })} - ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
        }
        return `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
      }
      case 'agenda':
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
      default:
        return format(date, "MMMM 'de' yyyy", { locale: ptBR });
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <header className="bg-[#4F46E5] shadow-lg">
      <div className="px-6 py-4">
        {/* --- LINHA SUPERIOR --- */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Calendário Salesiano</h1>
                <p className="text-white/80 text-sm">Colégio Salesiano Aracaju</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* === VISÃO DESKTOP (Telas SM e maiores) === */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="ghost" size="sm" onClick={handleShare}
                className="text-white hover:bg-white/10" title="Compartilhar Calendário"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              {onNewEvent && (
                <Button onClick={onNewEvent} className="bg-white text-[#4F46E5] hover:bg-white/90 font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atividade
                </Button>
              )}
              {user && (
                <div className="flex items-center gap-2 text-white">
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/10" title="Sair">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
            {/* === FIM DA VISÃO DESKTOP === */}

            {/* === VISÃO MOBILE (Telas menores que SM) === */}
            <div className="sm:hidden flex items-center gap-2">
              {onNewEvent && <Button onClick={onNewEvent} size="sm" className="bg-white text-[#4F46E5] hover:bg-white/90 font-semibold">Nova Atividade</Button>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}><LinkIcon className="mr-2 h-4 w-4" /> Compartilhar</DropdownMenuItem>
                  {isAdmin && onAdminPanelOpen && <DropdownMenuItem onClick={onAdminPanelOpen}><Settings className="mr-2 h-4 w-4" /> Painel Admin</DropdownMenuItem>}
                  {user && <DropdownMenuSeparator />}
                  {user && <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Sair</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* === FIM DA VISÃO MOBILE === */}
          </div>
        </div>

        {/* --- LINHA INFERIOR --- */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => onNavigate('prev')} className="text-white hover:bg-white/10 p-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <h2 className="text-xl font-semibold text-white min-w-[280px] text-center capitalize cursor-pointer hover:bg-white/10 rounded-md px-4 py-2">
                    {formatDateDisplay(currentDate, currentView)}
                  </h2>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentDate} onSelect={handleDateSelect} initialFocus /></PopoverContent>
              </Popover>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('next')} className="text-white hover:bg-white/10 p-2">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('today')} className="text-white hover:bg-white/10 font-medium">Hoje</Button>
            <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <ExportButton currentDate={currentDate} events={events} selectedCategories={selectedCategories} />
            {isAdmin && onAdminPanelOpen && (
              <Button variant="ghost" size="sm" onClick={onAdminPanelOpen} className="text-white hover:bg-white/10 hidden sm:flex" title="Painel Administrativo">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
