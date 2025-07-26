// src/components/Admin/AdminPanel.tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManagement } from "./CategoryManagement.tsx";
import { UserManagement } from "./UserManagement.tsx";
import { ActivityLogs } from "./ActivityLogs.tsx";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
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
            {/* CORREÇÃO: Componentes agora são auto-suficientes e não precisam de props. */}
            <TabsContent value="categories" className="flex-grow p-6 overflow-auto">
              <CategoryManagement />
            </TabsContent>
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
