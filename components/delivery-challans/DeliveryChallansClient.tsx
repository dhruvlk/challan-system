"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Building2,
  Copy,
  Edit,
  Eye,
  PlusCircle,
  Printer,
  Trash2,
} from "lucide-react"
import { useCompany } from "@/components/company-provider"
import { useAuth } from "@/hooks/useAuth"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { DownloadDeliveryChallanButton } from "@/components/delivery-challans/download-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  deleteDeliveryChallan,
  duplicateDeliveryChallan,
  getDeliveryChallans,
} from "@/services/delivery-challans.service"
import { getCustomers } from "@/services/customers.service"
import type { DeliveryChallan, DeliveryChallanFilters, DeliveryChallanStatus } from "@/types"

export default function DeliveryChallansClient() {
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<DeliveryChallanStatus | "">("")
  const [customerFilter, setCustomerFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [challans, setChallans] = useState<DeliveryChallan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<DeliveryChallan | null>(null)

  const filters: DeliveryChallanFilters = {
    search,
    status: statusFilter,
    customerId: customerFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const load = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const [data, customerList] = await Promise.all([
        getDeliveryChallans(selectedCompany.id, filters),
        getCustomers(selectedCompany.id),
      ])
      setChallans(data)
      setCustomers(customerList.map((c) => ({ id: c.id, name: c.name })))
    } catch {
      toast.error("Failed to load delivery challans")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [selectedCompany, search, statusFilter, customerFilter, dateFrom, dateTo])

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await deleteDeliveryChallan(toDelete.id)
      toast.success("Delivery challan deleted successfully.")
      await load()
    } catch {
      toast.error("Failed to delete delivery challan")
    }
    setDeleteDialogOpen(false)
    setToDelete(null)
  }

  const handleDuplicate = async (challan: DeliveryChallan) => {
    if (!selectedCompany) return
    try {
      await duplicateDeliveryChallan(challan.id, selectedCompany.id, user?.id)
      toast.success("Delivery challan duplicated successfully.")
      await load()
    } catch {
      toast.error("Failed to duplicate delivery challan")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-muted text-muted-foreground"
      case "Pending":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={Building2}
        title="No company selected"
        description="Select a company to manage delivery challans."
      />
    )
  }

  const columns = [
    {
      header: "Challan No",
      cell: (row: DeliveryChallan) => (
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={() => router.push(`/delivery-challans/${row.id}`)}
        >
          {row.challan_number}
        </button>
      ),
    },
    {
      header: "Date",
      cell: (row: DeliveryChallan) => format(new Date(row.date), "dd MMM yyyy"),
    },
    {
      header: "Customer",
      cell: (row: DeliveryChallan) => row.customer?.name ?? "—",
    },
    {
      header: "Quality",
      cell: (row: DeliveryChallan) => row.quality || "—",
    },
    {
      header: "Pieces",
      cell: (row: DeliveryChallan) => row.total_pieces,
    },
    {
      header: "MTS",
      cell: (row: DeliveryChallan) => Number(row.total_meters).toFixed(2),
    },
    {
      header: "Status",
      cell: (row: DeliveryChallan) => (
        <Badge variant="secondary" className={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (row: DeliveryChallan) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="View"
            onClick={() => router.push(`/delivery-challans/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Print"
            onClick={() => router.push(`/delivery-challans/${row.id}/print`)}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <DownloadDeliveryChallanButton challan={row} company={selectedCompany} />
          <Button
            variant="ghost"
            size="icon"
            title="Edit"
            onClick={() => router.push(`/delivery-challans/${row.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(row)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            className="text-destructive"
            onClick={() => {
              setToDelete(row)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Delivery Challans"
        description="Create and manage textile delivery challans."
        action={
          <Button onClick={() => router.push("/delivery-challans/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Delivery Challan
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="dc-filter-search" className="text-xs font-medium text-muted-foreground">
                Search
              </Label>
              <Input
                id="dc-filter-search"
                placeholder="Challan no., customer, quality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select
                value={statusFilter || "__all"}
                onValueChange={(val) =>
                  setStatusFilter(val === "__all" || !val ? "" : (val as DeliveryChallanStatus))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status">
                    {(value: string | null) => {
                      if (!value || value === "__all") return "All"
                      return value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
              <Select
                value={customerFilter || "__all"}
                onValueChange={(val) => setCustomerFilter(val === "__all" || !val ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Customer">
                    {(value: string | null) => {
                      if (!value || value === "__all") return "All"
                      return customers.find((c) => c.id === value)?.name ?? "Customer"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-filter-date-from" className="text-xs font-medium text-muted-foreground">
                From Date
              </Label>
              <Input
                id="dc-filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-filter-date-to" className="text-xs font-medium text-muted-foreground">
                To Date
              </Label>
              <Input
                id="dc-filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <DataTable columns={columns} data={challans} isLoading={isLoading} hideSearch />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete delivery challan?"
        description={`This will permanently delete ${toDelete?.challan_number ?? "this delivery challan"}.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
