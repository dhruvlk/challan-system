import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconClassName?: string
  isLoading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("transition-shadow duration-200 hover:shadow-elevated", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 ring-1 ring-primary/10",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}
