// src/components/Calendar/ShareButton.tsx
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ShareButton() {
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      className="text-white hover:bg-white/10 rounded-full flex-shrink-0 h-10 w-10 sm:w-auto sm:px-3 sm:py-2"
      title="Compartilhar Link"
    >
      <Link className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Compartilhar</span>
    </Button>
  );
}