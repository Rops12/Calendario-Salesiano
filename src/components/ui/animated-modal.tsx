// src/components/ui/animated-modal.tsx
import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedModalProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  trigger,
  children,
  className,
  onOpenChange,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(isOpen);
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {React.cloneElement(trigger as React.ReactElement, { ref: triggerRef })}
      </Dialog.Trigger>

      <AnimatePresence>
        {open && triggerRect && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/60 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className={cn("bg-card rounded-2xl shadow-strong w-full max-w-md mx-auto", className)}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  x: triggerRect.left + triggerRect.width / 2 - window.innerWidth / 2,
                  y: triggerRect.top + triggerRect.height / 2 - window.innerHeight / 2,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  x: triggerRect.left + triggerRect.width / 2 - window.innerWidth / 2,
                  y: triggerRect.top + triggerRect.height / 2 - window.innerHeight / 2,
                }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                  duration: 0.25,
                }}
              >
                <Dialog.Content className="h-full w-full outline-none">
                  {children}
                </Dialog.Content>
              </motion.div>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};