// src/components/Admin/AdminPanel.tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/useAdmin.ts";
import { useCategories } from "@/hooks/useCategories.tsx";
// CORREÇÃO: Adicionado o caminho completo e a extensão do arquivo
import { CategoriesManagement } from "./CategoriesManagement.tsx";
import { UsersManagement } from "./UsersManagement.tsx";
import { ActivityLogList } from "./ActivityLogList.tsx";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const { users, activityLogs, isLoading, addCategory, updateCategory, deleteCategory } = useAdmin();
  const { categories, refetchCategories } = useCategories();

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
            <SheetDescription>Gerencie usuários, categorias e veja os logs de atividade do sistema.</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="categories" className="flex-grow flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="categories">Segmentos</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="activity">Logs</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="categories" className="flex-grow p-6 overflow-auto">
              <CategoriesManagement
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="users" className="flex-grow p-6 overflow-auto">
              <UsersManagement users={users} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="activity" className="flex-grow p-6 overflow-auto">
              <ActivityLogList logs={activityLogs} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
