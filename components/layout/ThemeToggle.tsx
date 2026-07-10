"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a static placeholder of the same size
    return <div className="w-[72px] h-[36px] rounded-full bg-muted/50 border border-border/50" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="relative flex items-center justify-between p-[4px] rounded-full bg-muted/30 border border-border/50 shadow-inner w-[72px] h-[36px]">
      {/* Sliding Background */}
      <motion.div
        className="absolute top-[3px] bottom-[3px] w-[30px] rounded-full bg-blue-600 shadow-md z-0"
        initial={false}
        animate={{
          left: isDark ? "36px" : "4px",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />
      
      {/* Sun Icon */}
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "relative z-10 flex items-center justify-center w-[30px] h-full rounded-full transition-colors duration-200 outline-none",
          !isDark ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light Theme</span>
      </button>

      {/* Moon Icon */}
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "relative z-10 flex items-center justify-center w-[30px] h-full rounded-full transition-colors duration-200 outline-none",
          isDark ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark Theme</span>
      </button>
    </div>
  )
}
