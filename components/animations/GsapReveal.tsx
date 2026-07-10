"use client"

import { ReactNode, useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

interface GsapRevealProps {
  children: ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "scale" | "blur"
  delay?: number
  duration?: number
  stagger?: number
  triggerOffset?: string // GSAP scrub trigger start e.g. "top 80%"
}

export function GsapReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 1,
  stagger = 0,
  triggerOffset = "top 85%",
}: GsapRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    // Define starting state based on direction
    let fromState: gsap.TweenVars = { opacity: 0 }
    
    switch (direction) {
      case "up":
        fromState.y = 50
        break
      case "down":
        fromState.y = -50
        break
      case "left":
        fromState.x = 50
        break
      case "right":
        fromState.x = -50
        break
      case "scale":
        fromState.scale = 0.9
        break
      case "blur":
        fromState.filter = "blur(10px)"
        break
    }

    const anim = gsap.fromTo(
      el.children.length > 1 && stagger > 0 ? el.children : el,
      fromState,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration,
        delay,
        stagger: stagger > 0 ? stagger : undefined,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: triggerOffset,
          toggleActions: "play none none reverse", // Play when scrolling down, reverse when scrolling up
        },
      }
    )

    return () => {
      anim.kill()
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [direction, delay, duration, stagger, triggerOffset])

  return (
    <div ref={elementRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  )
}
