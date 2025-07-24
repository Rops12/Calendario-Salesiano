// src/components/Admin/AdminPanel.tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useCategories";
import { CategoryManagement } from "./CategoryManagement.tsx";
import { UserManagement } from "./UserManagement.tsx";
import { ActivityLogs } from "./ActivityLogs.tsx"; // CORREÇÃO: Importado o componente correto do ficheiro correto.

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  // O hook useAdmin já não é necessário aqui para passar dados,
  // mas vamos mantê-lo para as funções de manipulação de categorias que precisam do refetch.
  const { addCategory, updateCategory, deleteCategory } = useAdmin();
  const { refetchCategories } = useCategories();

  // Estas funções agora chamam o refetch para atualizar a lista de categorias em toda a aplicação.
  const handleUpdateCategory = async (...args: Parameters<typeof updateCategory>) => {
    await updateCategory(...args);
    await refetchCategories();
  };

  const handleAddCategory = async (...args: Parameters<typeof addCategory>) => {
    await addCategory(...args);
    await refetchCategories();
  };

  const handleDeleteCategory = async (...args: Parameters<typeof deleteCategory>) => {
    await deleteCategory(...args);
    await refetchCategories();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6">
            <SheetTitle>Painel Administrativo</SheetTitle>
            <SheetDescription>Gerencie usuários, segmentos e veja os logs de atividade do sistema.</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="categories" className="flex-grow flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="categories">Segmentos</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="activity">Logs</TabsTrigger>
              </TabsList>
            </div>
            {/* CORREÇÃO: O componente CategoryManagement já não recebe as categorias via props, mas ainda recebe as funções. */}
            <TabsContent value="categories" className="flex-grow p-6 overflow-auto">
              <CategoryManagement
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </TabsContent>
             {/* CORREÇÃO: Os componentes agora são auto-suficientes e não precisam de props. */}
            <TabsContent value="users" className="flex-grow p-6 overflow-auto">
              <UserManagement />
            </TabsContent>
            <TabsContent value="activity" className="flex-grow p-6 overflow-auto">
              <ActivityLogs />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
