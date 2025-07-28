// src/components/Admin/AdminPanel.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryManager } from "./CategoryManager";
import { UserManager } from "./UserManager";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  return (
    // Substituímos o <Sheet> por <Dialog>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Painel Administrativo</DialogTitle>
          <DialogDescription>
            Gerencie as categorias e permissões de usuários do calendário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-8">
          <CategoryManager />
          <UserManager />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
