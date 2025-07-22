// ... (importações)

export function CalendarGrid({
  // ... (props)
}: CalendarGridProps) {
  // ... (lógica do componente)

  const getDayCardStyles = (date: Date, eventType: string | null) => {
    if (eventType) {
      // Manteremos a lógica para dias especiais para os próximos passos
      return '';
    }
    
    // Estilos para dias normais
    if (!isCurrentMonth(date)) return 'bg-muted/40 text-muted-foreground/70';
    return 'bg-card-day'; // Nova cor de fundo para dias normais
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-transparent animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Header */}
          <div className="grid grid-cols-7">
            {daysOfWeek.map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const dateStr = date.toISOString().split('T')[0];
              const specialEventType = getSpecialEventType(date);
              
              return (
                <Droppable droppableId={`day-${dateStr}`} key={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "group relative min-h-[120px] p-3 rounded-xl shadow-soft cursor-pointer transition-all duration-200 hover:shadow-strong hover:-translate-y-1", // Cantos mais arredondados
                        getDayCardStyles(date, specialEventType)
                      )}
                      onClick={() => onDateClick(date)}
                    >
                      {/* ... (Botão de adicionar) ... */}

                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-3 transition-all duration-200",
                        isToday(date) && "bg-primary text-primary-foreground", // Estilo para o dia atual
                        !isToday(date) && isCurrentMonth(date) && "text-foreground",
                        !isCurrentMonth(date) && "text-muted-foreground/50"
                      )}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, eventIndex) => (
                          <DraggableEvent
                            key={event.id}
                            event={event}
                            index={eventIndex}
                            onClick={onEventClick}
                            isDraggable={!!onEventDrop}
                            isSpecialDay={false} // Para dias normais, é sempre false
                          />
                        ))}
                        
                        {/* ... (Restante do componente) ... */}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
