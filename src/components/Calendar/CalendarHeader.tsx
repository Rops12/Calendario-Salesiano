import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Settings, LogOut, User } from 'lucide-react';
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
  isAdmin
}: CalendarHeaderProps) {
  const { user, logout } = useAuth();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const formatDateDisplay = (date: Date, view: CalendarView) => {
    switch(view) {
      case 'month':
        return format(date, 'MMMM \'de\' yyyy', { locale: ptBR });
      case 'week': {
        const start = startOfWeek(date, { locale: ptBR, weekStartsOn: 0 }); // Domingo
        const end = endOfWeek(date, { locale: ptBR, weekStartsOn: 0 }); // Sábado
        if (start.getMonth() === end.getMonth()) {
          return `${format(start, 'd')} - ${format(end, 'd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}`;
        }
        if (start.getFullYear() !== end.getFullYear()) {
          return `${format(start, 'd \'de\' MMM \'de\' yyyy', { locale: ptBR })} - ${format(end, 'd \'de\' MMM \'de\' yyyy', { locale: ptBR })}`;
        }
        return `${format(start, 'd \'de\' MMM', { locale: ptBR })} - ${format(end, 'd \'de\' MMM \'de\' yyyy', { locale: ptBR })}`;
      }
      case 'agenda':
        return format(date, 'd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
      default:
        return format(date, 'MMMM \'de\' yyyy', { locale: ptBR });
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
  };

  return (
    <header className="bg-gradient-primary shadow-medium p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Calendário Salesiano
              </h1>
              <p className="text-white/80 text-sm">
                Colégio Salesiano Aracaju
              </p>
            </div>
          </div>
          
          {onNewEvent && (
            <Button 
              onClick={() => onNewEvent()}
              className="bg-white text-primary hover:bg-white/90 shadow-soft"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('prev')}
                className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <h2 className="text-xl font-semibold text-white min-w-[280px] text-center capitalize transition-all duration-300 cursor-pointer hover:bg-white/10 rounded-md px-3 py-1">
                    {formatDateDisplay(currentDate, currentView)}
                  </h2>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('next')}
                className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('today')}
              className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              Hoje
            </Button>

            <ViewSwitcher
              currentView={currentView}
              onViewChange={onViewChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              />
            </div>
            
            <ExportButton 
              currentDate={currentDate}
              events={events}
              selectedCategories={selectedCategories}
            />
            
            {isAdmin && onAdminPanelOpen && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onAdminPanelOpen}
                className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
                title="Painel Administrativo"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}

            {/* User Info */}
            <div className="flex items-center gap-2 text-white">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.email}</span>
                {user?.isAdmin && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
