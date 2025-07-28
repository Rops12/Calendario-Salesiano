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
  note: string // Adicionado para manter a estrutura original do formulário
  setNote: (note: string) => void // Adicionado para manter a estrutura original do formulário
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
  const [note, setNote] = useState("") // Adicionado para o formulário

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
    setNote("") // Limpa o estado do formulário ao fechar
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
    note,
    setNote,
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
  const { isOpen, closeFloatingPanel, activeDate, activeEvents } =
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

  // --- CORREÇÃO AQUI ---
  // Simplificamos as variantes para uma animação de fade e scale que funciona corretamente
  // com o posicionamento fixo do painel.
  const variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };
  // --- FIM DA CORREÇÃO ---

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
            className={cn(
              "fixed z-50 overflow-hidden border border-zinc-950/10 bg-background shadow-lg outline-none dark:border-zinc-50/10 dark:bg-zinc-800",
              "bottom-4 right-4 top-auto left-auto w-[400px] max-h-[80vh] rounded-2xl",
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
            {children({ activeDate, activeEvents })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


// =================================================================//
// == O RESTANTE DO CÓDIGO ORIGINAL FOI RESTAURADO ABAIXO           ==//
// =================================================================//

interface FloatingPanelHeaderProps {
  children: React.ReactNode
  className?: string
}

export function FloatingPanelHeader({
  children,
  className,
}: FloatingPanelHeaderProps) {
  return (
    <motion.div
      className={cn(
        "px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingPanelBodyProps {
  children: React.ReactNode
  className?: string
}

export function FloatingPanelBody({
  children,
  className,
}: FloatingPanelBodyProps) {
  return (
    <motion.div
      className={cn("p-4", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingPanelFooterProps {
  children: React.ReactNode
  className?: string
}

export function FloatingPanelFooter({
  children,
  className,
}: FloatingPanelFooterProps) {
  return (
    <motion.div
      className={cn("flex justify-between px-4 py-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingPanelCloseButtonProps {
  className?: string
}

export function FloatingPanelCloseButton({
  className,
}: FloatingPanelCloseButtonProps) {
  const { closeFloatingPanel } = useFloatingPanel()

  return (
    <motion.button
      type="button"
      className={cn("flex items-center", className)}
      onClick={closeFloatingPanel}
      aria-label="Close floating panel"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ArrowLeftIcon size={16} className="text-zinc-900 dark:text-zinc-100" />
    </motion.button>
  )
}

// Exportando todos os componentes para uso
export {
  FloatingPanelRoot as Root,
  FloatingPanelContent as Content,
  FloatingPanelHeader as Header,
  FloatingPanelBody as Body,
  FloatingPanelFooter as Footer,
  FloatingPanelCloseButton as CloseButton,
}
