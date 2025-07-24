// src/components/Admin/ActivityLogs.tsx
import {
  PlusCircle,
  Edit,
  Trash2,
  Palette,
  User,
  FileText,
  Activity,
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const actionDetails = {
  create: { label: 'Criou', icon: PlusCircle, color: 'text-green-500' },
  update: { label: 'Atualizou', icon: Edit, color: 'text-blue-500' },
  delete: { label: 'Excluiu', icon: Trash2, color: 'text-red-500' },
  category_add: { label: 'Adicionou', icon: PlusCircle, color: 'text-green-500' },
  category_remove: { label: 'Removeu', icon: Trash2, color: 'text-red-500' },
  category_update: { label: 'Atualizou', icon: Edit, color: 'text-blue-500' },
};

const targetDetails = {
  event: { label: 'Evento', icon: FileText },
  category: { label: 'Categoria', icon: Palette },
  user: { label: 'Usuário', icon: User },
};

export const ActivityLogs = () => {
  const { activityLogs } = useAdmin();

  if (activityLogs.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-lg bg-muted/30">
        <Activity className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activityLogs.map((log) => {
        const action = actionDetails[log.action] || actionDetails.update;
        const target = targetDetails[log.target] || targetDetails.event;
        const ActionIcon = action.icon;
        const TargetIcon = target.icon;

        return (
          <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg bg-card">
            <div className={`p-2 rounded-full bg-muted ${action.color}`}>
              <ActionIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                <span className="font-bold">{log.userName}</span> {action.label.toLowerCase()} um(a) <span className="font-semibold">{target.label.toLowerCase()}</span>.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {log.description}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground/80 mt-2 cursor-default">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ptBR })}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TargetIcon className="h-4 w-4" />
              <span>{target.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
