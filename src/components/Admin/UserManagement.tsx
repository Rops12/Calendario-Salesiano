// src/components/Admin/UserManagement.tsx
import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminUser } from '@/types/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const roleLabels = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador'
};

const roleVariants = {
  admin: 'destructive',
  editor: 'default',
  viewer: 'secondary'
} as const;

const UserForm = ({
  user,
  onSave,
  onClose,
}: {
  user: Partial<AdminUser> | null;
  onSave: (data: Partial<AdminUser>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'viewer',
  });

  const handleSubmit = () => {
    if (formData.name && formData.email) {
      onSave(formData);
    }
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome completo do usuário"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@salesiano.com.br"
            disabled={!!user} // Não permite editar email
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-role">Permissão</Label>
          <Select
            value={formData.role}
            onValueChange={(value: 'admin' | 'editor' | 'viewer') =>
              setFormData(prev => ({ ...prev, role: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Visualizador</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose} variant="outline">Cancelar</Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Usuário
        </Button>
      </DialogFooter>
    </>
  );
};


export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const handleOpenForm = (user: AdminUser | null = null) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleSave = (data: Partial<AdminUser>) => {
    if (editingUser) {
      updateUser(editingUser.id, data);
    } else {
      addUser(data as Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (id !== currentUser.id) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Adicione, edite ou remova usuários e suas permissões de acesso.
        </p>
        <Button
          onClick={() => handleOpenForm()}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Altere os dados do usuário abaixo.' : 'Atenção: A criação de usuários aqui é simbólica. O cadastro real deve ser feito no provedor de autenticação.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSave={handleSave}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleVariants[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <TooltipProvider delayDuration={100}>
                    <div className="flex gap-2 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleOpenForm(user)}
                            size="sm"
                            variant="outline"
                            disabled={user.id === currentUser.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        {user.id === currentUser.id && (
                          <TooltipContent>
                            <p>Você não pode editar sua própria conta.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={user.id === currentUser.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "{user.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </span>
                        </TooltipTrigger>
                        {user.id === currentUser.id && (
                          <TooltipContent>
                            <p>Você não pode excluir sua própria conta.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
