import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const actionLabels = {
  create: 'Criou',
  update: 'Atualizou',
  delete: 'Excluiu',
  category_add: 'Adicionou categoria',
  category_remove: 'Removeu categoria',
  category_update: 'Atualizou categoria'
};

const targetLabels = {
  event: 'Evento',
  category: 'Categoria',
  user: 'Usuário'
};

const actionVariants = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  category_add: 'default',
  category_remove: 'destructive',
  category_update: 'secondary'
} as const;

export const ActivityLogs = () => {
  const { activityLogs } = useAdmin();

  if (activityLogs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Histórico de Atividades</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-sm">
                {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">
                {log.userName}
              </TableCell>
              <TableCell>
                <Badge variant={actionVariants[log.action]}>
                  {actionLabels[log.action]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {targetLabels[log.target]}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md">
                {log.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};