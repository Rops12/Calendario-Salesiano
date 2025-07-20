import { CalendarEvent, EventCategory, eventCategories } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { format, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
}

export function AgendaView({ 
  currentDate, 
  events, 
  selectedCategories, 
  onEventClick 
}: AgendaViewProps) {
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate ? event.endDate.split('T')[0] : eventStartDate;
      
      return dateStr >= eventStartDate && dateStr <= eventEndDate && selectedCategories.includes(event.category);
    }).sort((a, b) => a.title.localeCompare(b.title));
  };

  const getCategoryData = (category: EventCategory) => {
    return eventCategories.find(cat => cat.value === category);
  };

  const todayEvents = getEventsForDate(currentDate);

  return (
    <div className="bg-card shadow-soft animate-fade-in">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full font-semibold bg-primary text-primary-foreground">
              {currentDate.getDate()}
            </div>
            <div>
              <h3 className="font-semibold text-xl text-primary">
                {format(currentDate, 'EEEE', { locale: ptBR })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg">
                  Nenhum evento encontrado para hoje
                </div>
              </div>
            ) : (
              todayEvents.map((event) => {
                const categoryData = getCategoryData(event.category);

                const getEventTypeStyles = () => {
                  switch (event.eventType) {
                    case 'feriado':
                      return 'bg-red-100 text-red-800 border-red-200 font-semibold';
                    case 'recesso':
                      return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
                    case 'evento':
                      return 'bg-blue-100 text-blue-800 border-blue-200 font-semibold';
                    default: // normal
                      const categoryStyles = {
                        geral: 'bg-blue-100 text-blue-800 border-blue-200',
                        infantil: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                        fundamental1: 'bg-green-100 text-green-800 border-green-200',
                        fundamental2: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                        medio: 'bg-purple-100 text-purple-800 border-purple-200',
                        pastoral: 'bg-pink-100 text-pink-800 border-pink-200',
                        esportes: 'bg-orange-100 text-orange-800 border-orange-200',
                        robotica: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                        biblioteca: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        nap: 'bg-rose-100 text-rose-800 border-rose-200'
                      };
                      return categoryStyles[event.category] || categoryStyles.geral;
                  }
                };

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                      "hover:scale-[1.02] hover:shadow-medium",
                      getEventTypeStyles()
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1 break-words whitespace-normal leading-tight">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground break-words whitespace-normal leading-tight mb-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                            {
                              'bg-blue-200 text-blue-800': event.category === 'geral',
                              'bg-yellow-200 text-yellow-800': event.category === 'infantil', 
                              'bg-green-200 text-green-800': event.category === 'fundamental1',
                              'bg-cyan-200 text-cyan-800': event.category === 'fundamental2',
                              'bg-purple-200 text-purple-800': event.category === 'medio',
                              'bg-pink-200 text-pink-800': event.category === 'pastoral',
                              'bg-orange-200 text-orange-800': event.category === 'esportes',
                              'bg-indigo-200 text-indigo-800': event.category === 'robotica',
                              'bg-emerald-200 text-emerald-800': event.category === 'biblioteca',
                              'bg-rose-200 text-rose-800': event.category === 'nap'
                            }
                          )}>
                            <div className={cn(
                              "w-2 h-2 rounded-full mr-2",
                              {
                                'bg-blue-500': event.category === 'geral',
                                'bg-yellow-500': event.category === 'infantil', 
                                'bg-green-500': event.category === 'fundamental1',
                                'bg-cyan-500': event.category === 'fundamental2',
                                'bg-purple-500': event.category === 'medio',
                                'bg-pink-500': event.category === 'pastoral',
                                'bg-orange-500': event.category === 'esportes',
                                'bg-indigo-500': event.category === 'robotica',
                                'bg-emerald-500': event.category === 'biblioteca',
                                'bg-rose-500': event.category === 'nap'
                              }
                            )} />
                            {categoryData?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}