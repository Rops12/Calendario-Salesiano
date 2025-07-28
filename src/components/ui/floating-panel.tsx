// src/components/ui/floating-panel.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/types/calendar"

const TRANSITION = {
  type: "spring",
  bounce: 0.1,
  duration: 0.4,
}

// Tipagem adaptada para o calendário
interface FloatingPanelContextType {
  isOpen: boolean
  openFloatingPanel: (rect: DOMRect, date: Date, events: CalendarEvent[]) => void
  closeFloatingPanel: () => void
  uniqueId: string
  triggerRect: DOMRect | null
  activeDate: Date | null
  activeEvents: CalendarEvent[]
  title: string
  setTitle: (title: string) => void
}

const FloatingPanelContext = createContext<
  FloatingPanelContextType | undefined
>(undefined)

export function useFloatingPanel() {
  const context = useContext(FloatingPanelContext)
  if (!context) {
    throw new Error(
      "useFloatingPanel must be used within a FloatingPanelProvider"
    )
  }
  return context
}

// Lógica adaptada para o calendário
function useFloatingPanelLogic() {
  const uniqueId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [title, setTitle] = useState("")
  const [activeDate, setActiveDate] = useState<Date | null>(null)
  const [activeEvents, setActiveEvents] = useState<CalendarEvent[]>([])

  const openFloatingPanel = (
    rect: DOMRect,
    date: Date,
    events: CalendarEvent[]
  ) => {
    setTriggerRect(rect)
    setActiveDate(date)
    setActiveEvents(events)
    setIsOpen(true)
  }

  const closeFloatingPanel = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    openFloatingPanel,
    closeFloatingPanel,
    uniqueId,
    triggerRect,
    activeDate,
    activeEvents,
    title,
    setTitle,
  }
}

interface FloatingPanelRootProps {
  children: React.ReactNode
  className?: string
}

export function FloatingPanelRoot({
  children,
  className,
}: FloatingPanelRootProps) {
  const floatingPanelLogic = useFloatingPanelLogic()

  return (
    <FloatingPanelContext.Provider value={floatingPanelLogic}>
      <MotionConfig transition={TRANSITION}>
        <div className={cn("relative", className)}>{children}</div>
      </MotionConfig>
    </FloatingPanelContext.Provider>
  )
}

// O componente Trigger não será usado diretamente no grid, mas o mantemos para outros usos
export function FloatingPanelTrigger({
  children,
  className,
  title,
}: FloatingPanelTriggerProps) {
  const { openFloatingPanel, uniqueId, setTitle } = useFloatingPanel()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (triggerRef.current) {
      // Adapte esta chamada conforme necessário, passando data e eventos
      // openFloatingPanel(triggerRef.current.getBoundingClientRect(), new Date(), [])
      setTitle(title)
    }
  }

  return (
    <motion.button
      ref={triggerRef}
      layoutId={`floating-panel-trigger-${uniqueId}`}
      className={cn(
        "flex h-9 items-center border border-zinc-950/10 bg-white px-3 text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50",
        className
      )}
      style={{ borderRadius: 8 }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-haspopup="dialog"
      aria-expanded={false}
    >
      {children}
    </motion.button>
  )
}

interface FloatingPanelTriggerProps {
  children: React.ReactNode
  className?: string
  title: string
}

interface FloatingPanelContentProps {
  children: (props: {
    activeDate: Date | null
    activeEvents: CalendarEvent[]
  }) => React.ReactNode
  className?: string
}

export function FloatingPanelContent({
  children,
  className,
}: FloatingPanelContentProps) {
  const { isOpen, closeFloatingPanel, uniqueId, triggerRect, activeDate, activeEvents } =
    useFloatingPanel()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        closeFloatingPanel()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [closeFloatingPanel])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFloatingPanel()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeFloatingPanel])

  const variants = {
    hidden: {
      opacity: 0,
      scale: triggerRect ? 0.8 : 0.9,
      x: triggerRect ? triggerRect.left : "0%",
      y: triggerRect ? triggerRect.top : "0%",
      width: triggerRect ? triggerRect.width : "100%",
      height: triggerRect ? triggerRect.height : "auto",
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: "0%",
      y: "0%",
      width: "100%",
      height: "auto",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={closeFloatingPanel}
          />
          <motion.div
            ref={contentRef}
            layoutId={`floating-panel-${uniqueId}`}
            className={cn(
              "fixed z-50 overflow-hidden border border-zinc-950/10 bg-background shadow-lg outline-none dark:border-zinc-50/10 dark:bg-zinc-800",
              "bottom-4 right-4 top-auto left-auto w-[400px] max-h-[80vh] rounded-2xl", // Posição e tamanho fixos
              className
            )}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={TRANSITION}
            role="dialog"
            aria-modal="true"
          >
            {/* O conteúdo é renderizado através de uma função para passar os dados */}
            {children({ activeDate, activeEvents })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// O restante dos componentes (Header, Body, Footer, etc.)
// foi mantido do seu código original para flexibilidade.
// ... (Cole o restante dos componentes do seu código aqui) ...

// Exemplo de como exportar
export {
  FloatingPanelContent as Content,
  FloatingPanelRoot as Root,
  // Adicione outros exports conforme necessário
}
