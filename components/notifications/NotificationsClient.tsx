"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCompany } from "@/components/company-provider"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { Button } from "@/components/ui/button"
import {
  clearAllNotifications,
  clearNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  syncPaymentDueNotifications,
} from "@/services/notifications.service"
import type { AppNotification } from "@/types"
import { cn } from "@/lib/utils"

export default function NotificationsClient() {
  const { selectedCompany } = useCompany()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!selectedCompany) return
    setLoading(true)
    try {
      await syncPaymentDueNotifications(selectedCompany.id)
      setItems(await getNotifications(selectedCompany.id, 100))
    } catch {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [selectedCompany])

  useEffect(() => {
    load()
  }, [load])

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={Bell}
        title="Select a company"
        description="Choose a company to view its notifications."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alerts"
        title="Notification Center"
        description={`Updates for ${selectedCompany.name}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="min-h-11"
              onClick={async () => {
                await markAllNotificationsRead(selectedCompany.id)
                load()
              }}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 text-destructive"
              onClick={async () => {
                await clearAllNotifications(selectedCompany.id)
                load()
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All clear"
          description="You’ll see low stock, payments, and document updates here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between",
                !item.is_read && "border-primary/30 bg-primary/5"
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={async () => {
                  if (!item.is_read) {
                    await markNotificationRead(item.id)
                    load()
                  }
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {item.type.replaceAll("_", " ")}
                  </span>
                </div>
                {item.message ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "dd MMM yyyy, hh:mm a")}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 self-end sm:self-start"
                onClick={async () => {
                  await clearNotification(item.id)
                  load()
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
