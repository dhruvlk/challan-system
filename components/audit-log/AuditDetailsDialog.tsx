"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AuditLogEntry } from "@/types"

interface AuditDetailsDialogProps {
  entry: AuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditDetailsDialog({ entry, open, onOpenChange }: AuditDetailsDialogProps) {
  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            {entry.action_type} action on {entry.module} ({entry.record_name})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">Performed By:</span>
              <p>{entry.performed_by}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Date & Time:</span>
              <p>{entry.date} {entry.time}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Module:</span>
              <p>{entry.module}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Action Type:</span>
              <p>{entry.action_type}</p>
            </div>
          </div>
          
          {(!!entry.old_value || !!entry.new_value) && (
            <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-4">
              <div>
                <h4 className="font-semibold mb-2 text-red-500">Old Data</h4>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">
                  {entry.old_value ? JSON.stringify(entry.old_value, null, 2) : "None"}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-500">New Data</h4>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">
                  {entry.new_value ? JSON.stringify(entry.new_value, null, 2) : "None"}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
