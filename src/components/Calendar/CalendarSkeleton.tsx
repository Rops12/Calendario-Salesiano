// src/components/Calendar/CalendarSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

// Apenas "export default" foi adicionado aqui
export default function CalendarSkeleton() {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-card shadow-medium rounded-lg overflow-hidden animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Skeleton for Calendar Header */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {daysOfWeek.map((day) => (
            <div 
              key={day} 
              className="p-4 text-center font-semibold text-foreground bg-muted/30 border-r border-border/30 last:border-r-0"
            >
              <Skeleton className="h-5 w-8 mx-auto bg-muted-foreground/10" />
            </div>
          ))}
        </div>

        {/* Skeleton for Calendar Body */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[120px] p-3 border-r border-b border-border/30"
            >
              <Skeleton className="h-8 w-8 rounded-full mb-3 bg-muted-foreground/10" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-full rounded bg-muted-foreground/10" />
                <Skeleton className="h-4 w-10/12 rounded bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}