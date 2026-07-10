"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function MotionDiv({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeInUp}
      className={className}
      {...props}
    />
  )
}

export function MotionStagger({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function PageTransition({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
