// src/components/Admin/CategoryManagement.tsx
import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch'; // Importado
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useAdmin } from '@/hooks/useAdmin';
import { CategoryConfig } from '@/types/admin';
import { cn } from '@/lib/utils';

const colorOptions = [
  { name: 'Azul', value: 'hsl(215, 100%, 50%)' },
  { name: 'Verde', value: 'hsl(142, 76%, 36%)' },
  { name: 'Amarelo', value: 'hsl(45, 93%, 47%)' },
  { name: 'Laranja', value: 'hsl(25, 95%, 53%)' },
  { name: 'Roxo', value: 'hsl(262, 83%, 58%)' },
  { name: 'Rosa', value: 'hsl(330, 81%, 60%)' },
  { name: 'Vermelho', value: 'hsl(0, 84%, 60%)' },
  { name: 'Ciano', value: 'hsl(188, 94%, 42%)' },
  { name: 'Marrom', value: 'hsl(20, 14%, 46%)' },
  { name: 'Cinza', value: 'hsl(215, 16%, 47%)' },
];

const CategoryForm = ({
  category,
  onSave,
  onClose,
}: {
  category: Partial<CategoryConfig> | null;
  onSave: (data: Omit<CategoryConfig, 'isActive'>) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    value: category?.value || '',
    label: category?.label || '',
    color: category?.color || colorOptions[0].value,
  });

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    // Não atualiza mais o 'value' se estiver editando
    if (category) {
      setFormData(prev => ({...prev, label}));
      return;
    }
    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    setFormData(prev => ({ ...prev, label, value }));
  };

  const handleSubmit = () => {
    if (formData.value && formData.label) {
      onSave(formData);
    }
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="new-label">Nome da Categoria</Label>
          <Input
            id="new-label"
            value={formData.label}
            onChange={handleLabelChange}
            placeholder="Ex: Eventos Esportivos"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-value">ID (gerado automaticamente)</Label>
          <Input
            id="new-value"
            value={formData.value}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {colorOptions.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  formData.color === color.value
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-transparent hover:border-muted-foreground'
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose} variant="outline">Cancelar</Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Categoria
        </Button>
      </DialogFooter>
    </>
  );
};

export const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);

  const handleOpenForm = (category: CategoryConfig | null = null) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSave = (data: Omit<CategoryConfig, 'isActive' | 'value'> & {value: string}) => {
    if (editingCategory) {
      // Passa o ID original e os dados atualizados
      updateCategory(editingCategory.value, { label: data.label, color: data.color });
    } else {
      addCategory(data);
    }
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (value: string) => {
    deleteCategory(value);
  };
  
  const handleStatusChange = (category: CategoryConfig, newStatus: boolean) => {
    updateCategory(category.value, { isActive: newStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Crie e gerencie as categorias para organizar os eventos do calendário.
        </p>
        <Button
          onClick={() => handleOpenForm()}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da categoria abaixo. O ID será gerado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSave={handleSave}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.value}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.label}</span>
                    <Badge variant="outline" className="font-mono text-xs">{category.value}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {/* MELHORIA APLICADA AQUI */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={(newStatus) => handleStatusChange(category, newStatus)}
                      aria-label="Status da categoria"
                    />
                    <span className="text-xs text-muted-foreground">
                      {category.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => handleOpenForm(category)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza de que deseja excluir a categoria "{category.label}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.value)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
