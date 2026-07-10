import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed shadow-none", className)}>
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        {description && (
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  )
}
