// src/components/Admin/AdminPanel.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// ==================================================================
// CORREÇÃO APLICADA AQUI: Usando caminhos absolutos com o alias '@'
// ==================================================================
import { CategoryManager } from "@/components/Admin/CategoryManagement.tsx";
import { UserManager } from "@/components/Admin/UserManager.tsx";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Painel Administrativo</DialogTitle>
          <DialogDescription>
            Gerencie as categorias e permissões de usuários do calendário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-8 py-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Gerenciar Categorias</h3>
            <CategoryManager />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Gerenciar Usuários</h3>
            <UserManager />
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
