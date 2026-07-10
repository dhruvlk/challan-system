"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

interface CounterProps {
  value: number
  direction?: "up" | "down"
  format?: (value: number) => string
  className?: string
  duration?: number
}

export function Counter({
  value,
  direction = "up",
  format = (val) => val.toFixed(0),
  className,
  duration = 1.5,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })
  
  const motionValue = useMotionValue(direction === "down" ? value * 2 : 0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  })

  useEffect(() => {
    if (inView) {
      motionValue.set(value)
    }
  }, [motionValue, inView, value])

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest)
      }
    })
  }, [springValue, format])

  return <span ref={ref} className={className}>{format(direction === "down" ? value * 2 : 0)}</span>
}
