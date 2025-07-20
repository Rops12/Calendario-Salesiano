import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAdmin } from '@/hooks/useAdmin';
import { User } from '@/types/admin';
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

export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: 'admin' | 'editor' | 'viewer' }>({ name: '', email: '', role: 'viewer' });
  const [editForm, setEditForm] = useState<Partial<User> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      addUser(newUser);
      setNewUser({ name: '', email: '', role: 'viewer' });
      setShowAddForm(false);
    }
  };

  const handleEditStart = (user: User) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleEditSave = () => {
    if (editForm && editingId) {
      updateUser(editingId, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (id !== currentUser.id) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Usuários do Sistema</h3>
        <Button 
          onClick={() => setShowAddForm(true)} 
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h4 className="font-medium">Adicionar Novo Usuário</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="new-name">Nome</Label>
              <Input
                id="new-name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@escola.com"
              />
            </div>
            <div>
              <Label htmlFor="new-role">Permissão</Label>
              <Select value={newUser.role} onValueChange={(value: 'admin' | 'editor' | 'viewer') => 
                setNewUser(prev => ({ ...prev, role: value }))
              }>
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
          <div className="flex gap-2">
            <Button onClick={handleAddUser} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button 
              onClick={() => setShowAddForm(false)} 
              variant="outline" 
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permissão</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {editingId === user.id ? (
                  <Input
                    value={editForm?.name || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="h-8"
                  />
                ) : (
                  user.name
                )}
              </TableCell>
              <TableCell>
                {editingId === user.id ? (
                  <Input
                    type="email"
                    value={editForm?.email || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="h-8"
                  />
                ) : (
                  user.email
                )}
              </TableCell>
              <TableCell>
                {editingId === user.id ? (
                  <Select 
                    value={editForm?.role || 'viewer'} 
                    onValueChange={(value: 'admin' | 'editor' | 'viewer') => 
                      setEditForm(prev => prev ? { ...prev, role: value } : null)
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={roleVariants[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {editingId === user.id ? (
                    <>
                      <Button onClick={handleEditSave} size="sm" variant="outline">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleEditCancel} size="sm" variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button 
                             onClick={() => handleEditStart(user)} 
                             size="sm" 
                             variant="outline"
                             disabled={user.id === currentUser.id}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                         </TooltipTrigger>
                         {user.id === currentUser.id && (
                           <TooltipContent>
                             <p>Você não pode editar sua própria conta</p>
                           </TooltipContent>
                         )}
                       </Tooltip>
                       {user.id !== currentUser.id ? (
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button size="sm" variant="outline">
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Tem certeza de que deseja excluir o usuário "{user.name}"? 
                                 Esta ação não pode ser desfeita.
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
                       ) : (
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button size="sm" variant="outline" disabled>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Você não pode excluir sua própria conta</p>
                           </TooltipContent>
                         </Tooltip>
                       )}
                     </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};