"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed rounded-xl bg-muted/20",
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-sm mb-4">
        <div className="text-muted-foreground/60 scale-125">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[400px] mb-6">
        {description}
      </p>
      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
