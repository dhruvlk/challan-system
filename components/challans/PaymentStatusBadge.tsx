import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ChallanPaymentStatus } from "@/types"

const STATUS_CONFIG: Record<
  ChallanPaymentStatus,
  { label: string; emoji: string; className: string }
> = {
  Pending: {
    label: "Pending",
    emoji: "🟡",
    className:
      "border-amber-200/60 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
  },
  "Partially Paid": {
    label: "Partial",
    emoji: "🟠",
    className:
      "border-orange-200/60 bg-orange-50 text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400",
  },
  Paid: {
    label: "Paid",
    emoji: "🟢",
    className:
      "border-emerald-200/60 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  Overdue: {
    label: "Overdue",
    emoji: "🔴",
    className:
      "border-red-200/60 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
  },
}

interface PaymentStatusBadgeProps {
  status: ChallanPaymentStatus
  className?: string
  showEmoji?: boolean
}

export function PaymentStatusBadge({
  status,
  className,
  showEmoji = true,
}: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-0.5 text-xs font-medium shadow-sm",
        config.className,
        className
      )}
    >
      {showEmoji && <span aria-hidden>{config.emoji}</span>}
      {config.label}
    </Badge>
  )
}
