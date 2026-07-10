"use client"

import { ReactNode } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  className?: string
  duration?: number
  fullWidth?: boolean
  once?: boolean
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className,
  duration = 0.5,
  fullWidth = false,
  once = true,
}: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: "-10%" })

  const fadeDirections = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...fadeDirections[direction],
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...fadeDirections[direction] }
      }
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom ease-out
      }}
      className={cn(fullWidth ? "w-full" : "", className)}
    >
      {children}
    </motion.div>
  )
}
