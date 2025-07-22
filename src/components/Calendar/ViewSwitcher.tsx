import { Calendar, List, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarView = 'month' | 'week' | 'agenda';

interface ViewSwitcherProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: 'month' as const, label: 'Mês', icon: Calendar },
    { id: 'week' as const, label: 'Semana', icon: Clock },
    { id: 'agenda' as const, label: 'Agenda', icon: List }
  ];

  return (
    <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
      {views.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(id)}
          className={cn(
            "flex items-center gap-2 transition-all duration-200 relative text-white px-4 py-2 rounded-md font-medium",
            currentView === id 
              ? "bg-white/20 shadow-sm text-white font-semibold" 
              : "text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </div>
  );
}