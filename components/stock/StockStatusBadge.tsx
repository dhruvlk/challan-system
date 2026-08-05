"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Stock, StockStatus } from "@/types"
import { getStockStatus } from "@/types"

const STATUS_STYLES: Record<StockStatus, string> = {
  Available: "bg-green-100 text-green-700 border-green-200",
  "Low Stock": "bg-red-100 text-red-600 border-red-200",
  "Out Of Stock": "bg-red-300 text-red-700 border-red-400",
}

const STATUS_DOT: Record<StockStatus, string> = {
  Available: "bg-green-500",
  "Low Stock": "bg-red-500",
  "Out Of Stock": "bg-red-700",
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
