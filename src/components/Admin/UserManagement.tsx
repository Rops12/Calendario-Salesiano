// src/components/Admin/UserManagement.tsx
import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

const roleDescriptions = {
  admin: 'Acesso completo ao sistema, incluindo gerenciamento de usuários',
  editor: 'Pode criar, editar e excluir eventos e categorias',
  viewer: 'Apenas visualização de eventos'
};

const UserForm = ({
  user,
  onSave,
  onClose,
}: {
  user: Partial<AdminUser> | null;
  onSave: (data: Partial<AdminUser>) => void;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'viewer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (formData.name && formData.email) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
        toast({
          title: user ? "Usuário atualizado" : "Usuário criado",
          description: user ? "As informações do usuário foram atualizadas." : "O usuário foi criado com sucesso.",
        });
        onClose();
      } catch (err: any) {
        setError(err.message || 'Erro ao salvar usuário');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('Preencha todos os campos obrigatórios');
    }
  };

  return (
    <>
      <div className="space-y-4 py-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome completo do usuário"
            disabled={isSubmitting}
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
            disabled={!!user || isSubmitting} // Não permite editar email de usuários existentes
          />
          {!user && (
            <p className="text-xs text-muted-foreground">
              Uma senha temporária será enviada por email
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-role">Permissão</Label>
          <Select
            value={formData.role}
            onValueChange={(value: 'admin' | 'editor' | 'viewer') =>
              setFormData(prev => ({ ...prev, role: value }))
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">
                <div>
                  <div className="font-medium">Visualizador</div>
                  <div className="text-xs text-muted-foreground">{roleDescriptions.viewer}</div>
                </div>
              </SelectItem>
              <SelectItem value="editor">
                <div>
                  <div className="font-medium">Editor</div>
                  <div className="text-xs text-muted-foreground">{roleDescriptions.editor}</div>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div>
                  <div className="font-medium">Administrador</div>
                  <div className="text-xs text-muted-foreground">{roleDescriptions.admin}</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {roleDescriptions[formData.role as keyof typeof roleDescriptions]}
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Usuário
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
};


export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, sendPasswordReset, currentUser, isLoading } = useAdmin();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState<string | null>(null);

  const handleOpenForm = (user: AdminUser | null = null) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleSave = async (data: Partial<AdminUser>) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await addUser(data as Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleDelete = async (id: string) => {
    if (id !== currentUser.id) {
      setIsDeleting(id);
      try {
        await deleteUser(id);
        toast({
          title: "Usuário excluído",
          description: "O usuário foi removido do sistema.",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao excluir",
          description: error.message || "Não foi possível excluir o usuário.",
          variant: "destructive"
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handlePasswordReset = async (email: string, userId: string) => {
    setIsSendingReset(userId);
    try {
      await sendPasswordReset(email);
      toast({
        title: "Email enviado",
        description: "Um email de redefinição de senha foi enviado para o usuário.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de redefinição.",
        variant: "destructive"
      });
    } finally {
      setIsSendingReset(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Carregando usuários...</p>
        </div>
        <div className="border rounded-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando lista de usuários...</p>
        </div>
      </div>
    );
  }

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
              {editingUser ? 'Altere os dados do usuário abaixo.' : 'Preencha os dados para criar um novo usuário no sistema.'}
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
                  {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                </TableCell>
                <TableCell>
                  <TooltipProvider delayDuration={100}>
                    <div className="flex gap-1 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handlePasswordReset(user.email, user.id)}
                            size="sm"
                            variant="outline"
                            disabled={isSendingReset === user.id || user.id === currentUser.id}
                          >
                            {isSendingReset === user.id ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enviar email de redefinição de senha</p>
                        </TooltipContent>
                      </Tooltip>
                      
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
                                  {isDeleting === user.id ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "{user.name}"? 
                                    <br /><br />
                                    <strong>Esta ação não pode ser desfeita e removerá:</strong>
                                    <ul className="list-disc list-inside mt-2 text-sm">
                                      <li>A conta do usuário</li>
                                      <li>Todos os dados associados</li>
                                      <li>Histórico de atividades</li>
                                    </ul>
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
      
      {users.length === 0 && (
        <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-lg bg-muted/30">
          <Plus className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="text-muted-foreground text-lg font-medium">Nenhum usuário encontrado</p>
            <p className="text-muted-foreground text-sm">Clique em "Novo Usuário" para adicionar o primeiro usuário.</p>
          </div>
        </div>
      )}
    </div>
  );
};
