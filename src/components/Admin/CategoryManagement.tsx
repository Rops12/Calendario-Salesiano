import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useAdmin } from '@/hooks/useAdmin';
import { CategoryConfig } from '@/types/admin';

const colorOptions = [
  { name: 'Azul', value: 'hsl(215, 100%, 50%)', class: 'bg-blue-500' },
  { name: 'Verde', value: 'hsl(142, 76%, 36%)', class: 'bg-green-500' },
  { name: 'Amarelo', value: 'hsl(45, 93%, 47%)', class: 'bg-yellow-500' },
  { name: 'Laranja', value: 'hsl(25, 95%, 53%)', class: 'bg-orange-500' },
  { name: 'Roxo', value: 'hsl(262, 83%, 58%)', class: 'bg-purple-500' },
  { name: 'Rosa', value: 'hsl(330, 81%, 60%)', class: 'bg-pink-500' },
  { name: 'Vermelho', value: 'hsl(0, 84%, 60%)', class: 'bg-red-500' },
  { name: 'Ciano', value: 'hsl(188, 94%, 42%)', class: 'bg-cyan-500' },
  { name: 'Marrom', value: 'hsl(20, 14%, 46%)', class: 'bg-amber-800' },
  { name: 'Cinza', value: 'hsl(215, 16%, 47%)', class: 'bg-gray-500' },
];

export const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ value: '', label: '', color: colorOptions[0].value });
  const [editForm, setEditForm] = useState<CategoryConfig | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.value && newCategory.label) {
      addCategory(newCategory);
      setNewCategory({ value: '', label: '', color: colorOptions[0].value });
      setShowAddForm(false);
    }
  };

  const handleEditStart = (category: CategoryConfig) => {
    setEditingId(category.value);
    setEditForm({ ...category });
  };

  const handleEditSave = () => {
    if (editForm && editingId) {
      updateCategory(editingId, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (value: string) => {
    deleteCategory(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Categorias do Sistema</h3>
        <Button 
          onClick={() => setShowAddForm(true)} 
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h4 className="font-medium">Adicionar Nova Categoria</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="new-label">Nome da Categoria</Label>
              <Input
                id="new-label"
                value={newCategory.label}
                onChange={(e) => {
                  const label = e.target.value;
                  const value = label
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .trim();
                  setNewCategory(prev => ({ ...prev, label, value }));
                }}
                placeholder="ex: Nova Categoria"
              />
            </div>
            <div>
              <Label htmlFor="new-value">Valor (ID) - Gerado automaticamente</Label>
              <Input
                id="new-value"
                value={newCategory.value}
                disabled
                className="bg-muted"
                placeholder="Será gerado automaticamente"
              />
            </div>
            <div>
              <Label htmlFor="new-color">Cor</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all ${
                      newCategory.color === color.value 
                        ? 'ring-2 ring-primary bg-muted' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} size="sm">
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
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.value}>
              <TableCell className="font-mono text-sm">
                {editingId === category.value ? (
                  <Input
                    value={editForm?.value || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, value: e.target.value } : null)}
                    className="h-8"
                  />
                ) : (
                  category.value
                )}
              </TableCell>
              <TableCell>
                {editingId === category.value ? (
                  <Input
                    value={editForm?.label || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, label: e.target.value } : null)}
                    className="h-8"
                  />
                ) : (
                  category.label
                )}
              </TableCell>
              <TableCell>
                {editingId === category.value ? (
                  <div className="flex flex-wrap gap-1">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditForm(prev => prev ? { ...prev, color: color.value } : null)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          editForm?.color === color.value ? 'ring-1 ring-primary' : ''
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: color.value }}
                        />
                      </button>
                    ))}
                  </div>
                 ) : (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: category.color }}
                    />
                    <Badge variant="secondary">
                      {colorOptions.find(c => c.value === category.color)?.name || 'Personalizada'}
                    </Badge>
                  </div>
                 )}
              </TableCell>
              <TableCell>
                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {editingId === category.value ? (
                    <>
                      <Button onClick={handleEditSave} size="sm" variant="outline">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleEditCancel} size="sm" variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => handleEditStart(category)} 
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
                    </>
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