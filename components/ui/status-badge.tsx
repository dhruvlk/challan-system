import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'active':
        return { color: 'bg-green-100 text-green-800 hover:bg-green-100' }
      case 'pending':
      case 'draft':
      case 'partial':
        return { color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' }
      case 'overdue':
      case 'cancelled':
      case 'returned':
        return { color: 'bg-red-100 text-red-800 hover:bg-red-100' }
      default:
        return { color: 'bg-gray-100 text-gray-800 hover:bg-gray-100' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge className={cn(config.color, "font-medium shadow-none", className)}>
      {status}
    </Badge>
  )
}
