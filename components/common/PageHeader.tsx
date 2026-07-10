import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm md:text-base">{description}</p>
        )}
      </div>
      {action && <div className="mt-2 md:mt-0">{action}</div>}
    </div>
  )
}
