"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Stock, StockStatus } from "@/types"
import { getStockStatus } from "@/types"

const STATUS_STYLES: Record<StockStatus, string> = {
  Available: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  "Low Stock": "border-amber-200/80 bg-amber-50 text-amber-900",
  "Out Of Stock": "border-rose-200/80 bg-rose-50 text-rose-800",
}

const STATUS_DOT: Record<StockStatus, string> = {
  Available: "bg-emerald-500",
  "Low Stock": "bg-amber-500",
  "Out Of Stock": "bg-rose-500",
}

export function StockStatusBadge({
  stock,
  status,
  className,
}: {
  stock?: Pick<Stock, "available_taka">
  status?: StockStatus
  className?: string
}) {
  const resolved = status ?? (stock ? getStockStatus(stock) : "Available")
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full font-medium",
        STATUS_STYLES[resolved],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[resolved])} />
      {resolved}
    </Badge>
  )
}
