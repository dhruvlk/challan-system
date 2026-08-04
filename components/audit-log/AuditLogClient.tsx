"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { ClipboardList, Eye } from "lucide-react"
import { getAuditLogsPaginated } from "@/services/local/audit.service"
import { AuditLogEntry } from "@/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditTimeline } from "./AuditTimeline"
import { AuditDetailsDialog } from "./AuditDetailsDialog"

export default function AuditLogClient() {
  const { selectedCompany } = useCompany()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const loadData = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const data = await getAuditLogsPaginated(selectedCompany.id, search, { page, pageSize: 20 })
      setLogs(data.data)
      setTotal(data.total)
    } catch {
      toast.error("Failed to load audit logs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCompany, search, page])

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Select a company"
        description="Choose a company from the header to view audit logs."
      />
    )
  }

  const columns = [
    { header: "Date & Time", cell: (l: AuditLogEntry) => `${l.date} ${l.time}`, className: "font-medium whitespace-nowrap" },
    { header: "Module", accessorKey: "module" as keyof AuditLogEntry },
    { 
      header: "Action", 
      cell: (l: AuditLogEntry) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
          {l.action_type}
        </span>
      )
    },
    { header: "Record", accessorKey: "record_name" as keyof AuditLogEntry },
    { header: "User", accessorKey: "performed_by" as keyof AuditLogEntry },
    {
      header: "Details",
      className: "text-right",
      cell: (l: AuditLogEntry) => (
        <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(l); setDetailsOpen(true) }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Audit Log"
        description={`Track activities and changes for ${selectedCompany.name}`}
      />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-8">
          <AuditTimeline logs={logs} onViewDetails={(entry) => { setSelectedEntry(entry); setDetailsOpen(true) }} />
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <DataTable
            data={logs}
            columns={columns}
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
            searchPlaceholder="Search logs..."
          />
        </TabsContent>
      </Tabs>

      <AuditDetailsDialog
        entry={selectedEntry}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}
