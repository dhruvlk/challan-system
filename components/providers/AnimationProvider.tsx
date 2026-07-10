"use client"

import { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

export function AnimationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
