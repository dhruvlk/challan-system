"use client"

import { ReactNode } from "react"
import { motion, Variants } from "framer-motion"

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delayChildren?: number
  staggerChildren?: number
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.1,
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
