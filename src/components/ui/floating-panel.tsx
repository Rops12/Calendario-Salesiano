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
  note: string
  setNote: (note: string) => void
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
  const [note, setNote] = useState("")

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
    setNote("")
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFloatingPanel()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeFloatingPanel])


  const variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeFloatingPanel} // Fecha ao clicar no overlay
        >
          {/* Fundo com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          {/* Conteúdo do Modal */}
          <motion.div
            ref={contentRef}
            className={cn(
              "relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-lg",
              className
            )}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={TRANSITION}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
          >
            {children({ activeDate, activeEvents })}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// --- TODOS OS SUBCOMPONENTES FORAM MANTIDOS ---

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
  
  export {
    FloatingPanelRoot as Root,
    FloatingPanelContent as Content,
    FloatingPanelHeader as Header,
    FloatingPanelBody as Body,
    FloatingPanelFooter as Footer,
    FloatingPanelCloseButton as CloseButton,
  }
