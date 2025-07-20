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
  { name: 'Azul', value: 'category-geral' },
  { name: 'Verde', value: 'category-infantil' },
  { name: 'Amarelo', value: 'category-fundamental1' },
  { name: 'Laranja', value: 'category-fundamental2' },
  { name: 'Roxo', value: 'category-medio' },
  { name: 'Rosa', value: 'category-pastoral' },
  { name: 'Vermelho', value: 'category-esportes' },
  { name: 'Ciano', value: 'category-robotica' },
  { name: 'Marrom', value: 'category-biblioteca' },
  { name: 'Cinza', value: 'category-nap' },
];

export const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ value: '', label: '', color: 'category-geral' });
  const [editForm, setEditForm] = useState<CategoryConfig | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.value && newCategory.label) {
      addCategory(newCategory);
      setNewCategory({ value: '', label: '', color: 'category-geral' });
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
              <select
                id="new-color"
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      {color.name}
                    </div>
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                    className={`flex items-center gap-2 px-3 py-1 rounded border text-xs ${
                      newCategory.color === color.value ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-${color.value.replace('category-', '')}-500`} />
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
                  <select
                    value={editForm?.color || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, color: e.target.value } : null)}
                    className="h-8 px-2 rounded border border-input bg-background"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="secondary" className={`bg-${category.color}/20 text-${category.color}`}>
                    {colorOptions.find(c => c.value === category.color)?.name || category.color}
                  </Badge>
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