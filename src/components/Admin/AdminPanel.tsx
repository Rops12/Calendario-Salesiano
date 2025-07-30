// src/components/Admin/AdminPanel.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryManagement } from "@/components/Admin/CategoryManagement.tsx";
import { UserManagement } from "@/components/Admin/UserManagement.tsx";
import { ActivityLogs } from "@/components/Admin/ActivityLogs.tsx";
import { Users, Palette, Activity } from 'lucide-react';

// Apenas "export default" foi adicionado aqui
export default function AdminPanel() {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 h-full">
      <Tabs defaultValue="users" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-200">
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Usuários</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><Palette className="h-4 w-4" /> Categorias</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><Activity className="h-4 w-4" /> Atividades</TabsTrigger>
        </TabsList>
        <div className="flex-grow overflow-y-auto">
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
          <TabsContent value="logs">
            <ActivityLogs />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}