import { AuditLogEntry } from "@/types"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuditTimelineProps {
  logs: AuditLogEntry[]
  onViewDetails: (entry: AuditLogEntry) => void
}

export function AuditTimeline({ logs, onViewDetails }: AuditTimelineProps) {
  const getBadgeColor = (action: string) => {
    switch (action) {
      case 'Create': return 'bg-green-100 text-green-800'
      case 'Edit': return 'bg-blue-100 text-blue-800'
      case 'Delete': return 'bg-red-100 text-red-800'
      case 'Login': return 'bg-purple-100 text-purple-800'
      case 'Logout': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {logs.map((log) => (
        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <span className="text-xs font-bold">{log.module.charAt(0)}</span>
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border shadow-sm bg-card flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBadgeColor(log.action_type)}`}>
                  {log.action_type}
                </span>
                <time className="text-xs font-medium text-muted-foreground">{log.date} {log.time}</time>
              </div>
              <div className="text-sm font-semibold text-foreground">{log.module} - {log.record_name}</div>
              <div className="text-sm text-muted-foreground">by {log.performed_by}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onViewDetails(log)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
