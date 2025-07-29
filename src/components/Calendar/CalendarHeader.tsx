// Imports adicionados para os novos componentes de menu e ícones
import { ChevronLeft, ChevronRight, MoreVertical, Share2, LogOut, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
// Componentes do DropdownMenu que usamos para o menu mobile
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';
import { toast } from 'sonner';

type CalendarHeaderProps = {
  currentDate: Date;
  currentView: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  onNewEvent?: () => void;
  user?: User;
  onLogout?: () => void; // Adicionamos a função de logout para o menu
};

export function CalendarHeader({
  currentDate,
  currentView,
  onDateChange,
  onViewChange,
  onNewEvent,
  user,
  onLogout
}: CalendarHeaderProps) {

  // ... (Funções handlePrev, handleNext, handleToday não foram alteradas)
  const handlePrev = () => {
    let newDate: Date;
    switch (currentView) {
      case 'day': newDate = new Date(currentDate.setDate(currentDate.getDate() - 1)); break;
      case 'week': newDate = new Date(currentDate.setDate(currentDate.getDate() - 7)); break;
      case 'month': newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1)); break;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    switch (currentView) {
      case 'day': newDate = new Date(currentDate.setDate(currentDate.getDate() + 1)); break;
      case 'week': newDate = new Date(currentDate.setDate(currentDate.getDate() + 7)); break;
      case 'month': newDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1)); break;
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };


  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link do calendário copiado para a área de transferência!'))
      .catch(err => toast.error('Não foi possível copiar o link.'));
  };

  // Nova função para lidar com o logout a partir do menu
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      toast.info('Você saiu da sua conta.');
    }
  };

  // ... (Função getFormattedDate não foi alterada)
  const getFormattedDate = () => {
    switch (currentView) {
      case 'month': return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      case 'week':
        const startOfWeek = format(new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())), 'dd MMM', { locale: ptBR });
        const endOfWeek = format(new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)), 'dd MMM yyyy', { locale: ptBR });
        return `${startOfWeek} - ${endOfWeek}`;
      case 'day': return format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      default: return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    }
  };


  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-800 text-white rounded-t-lg">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {/* ... (Parte esquerda do cabeçalho não foi alterada) ... */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-5 w-5" /></Button>
          <Button variant="outline" className="text-gray-800" onClick={handleToday}>Hoje</Button>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold capitalize">{getFormattedDate()}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* ================================================================== */}
        {/* INÍCIO DA MUDANÇA: Lógica para telas maiores (Desktop)              */}
        {/* Esta div só aparece em telas 'sm' (640px) ou maiores.              */}
        {/* A classe 'hidden' esconde em telas pequenas.                       */}
        {/* ================================================================== */}
        <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
            </Button>
            {onNewEvent && <Button onClick={() => onNewEvent()}>Nova Atividade</Button>}
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full"><UserIcon className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>

        {/* ================================================================== */}
        {/* INÍCIO DA MUDANÇA: Lógica para telas menores (Mobile)              */}
        {/* Esta div só aparece em telas pequenas, e desaparece a partir de 'sm'*/}
        {/* A classe 'sm:hidden' esconde em telas maiores.                     */}
        {/* ================================================================== */}
        <div className="flex sm:hidden items-center gap-2">
            {/* Mantemos o botão principal visível no mobile */}
            {onNewEvent && <Button size="sm" onClick={() => onNewEvent()}>Nova Atividade</Button>}
            
            {/* O novo menu que agrupa as ações secundárias */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Compartilhar</span>
                    </DropdownMenuItem>
                    {user && (
                        <>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={handleLogout}>
                             <LogOut className="mr-2 h-4 w-4" />
                             <span>Sair</span>
                         </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
