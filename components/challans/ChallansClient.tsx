"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { PlusCircle, Eye, Printer, Edit, Copy, Trash2, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getChallans,
  deleteChallan,
  duplicateChallan,
} from "@/services/challans.service"
import { getCustomers } from "@/services/customers.service"
import { Challan, ChallanFilters, ChallanStatus } from "@/types"
import { DownloadChallanButton } from "@/components/challans/download-button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

export default function ChallansClient() {
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | "">("")
  const [customerFilter, setCustomerFilter] = useState("")
  const [brokerFilter, setBrokerFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [challans, setChallans] = useState<Challan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [challanToDelete, setChallanToDelete] = useState<Challan | null>(null)

  const filters: ChallanFilters = {
    search,
    status: statusFilter,
    customerId: customerFilter,
    broker: brokerFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const loadChallans = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const [data, customerList] = await Promise.all([
        getChallans(selectedCompany.id, filters),
        getCustomers(selectedCompany.id),
      ])
      setChallans(data)
      setCustomers(customerList.map((c) => ({ id: c.id, name: c.name })))
    } catch {
      toast.error("Failed to load challans")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadChallans()
  }, [selectedCompany, search, statusFilter, customerFilter, brokerFilter, dateFrom, dateTo])

  const confirmDelete = async () => {
    if (!challanToDelete) return
    try {
      await deleteChallan(challanToDelete.id)
      toast.success("Challan deleted successfully.")
      await loadChallans()
    } catch {
      toast.error("Failed to delete challan")
    }
    setDeleteDialogOpen(false)
    setChallanToDelete(null)
  }

  const handleDuplicate = async (challan: Challan) => {
    if (!selectedCompany) return
    try {
      await duplicateChallan(challan.id, selectedCompany.id, user?.id)
      toast.success("Challan duplicated successfully.")
      await loadChallans()
    } catch {
      toast.error("Failed to duplicate challan")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-muted text-muted-foreground"
      case "Pending": return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      case "Delivered": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      case "Returned": return "bg-primary/10 text-primary"
      case "Cancelled": return "bg-destructive/10 text-destructive"
      default: return "bg-muted text-muted-foreground"
    }
  }

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={Building2}
        title="Select a company"
        description="Choose a company from the header to view and manage challans."
      />
    )
  }

  const columns = [
    { header: "Challan No.", accessorKey: "challan_number" as keyof Challan, className: "font-medium" },
    { header: "Date", cell: (c: Challan) => format(new Date(c.date), "dd/MM/yyyy") },
    { header: "Customer", cell: (c: Challan) => c.customer?.name || c.party?.name || "-" },
    { header: "Broker", cell: (c: Challan) => c.broker || "-" },
    { header: "Total", cell: (c: Challan) => `₹${(c.grand_total ?? 0).toFixed(2)}` },
    {
      header: "Status",
      cell: (c: Challan) => (
        <Badge variant="secondary" className={getStatusColor(c.status)}>{c.status}</Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (c: Challan) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/challans/${c.id}/print`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DownloadChallanButton challan={c} company={selectedCompany} />
          <Button variant="ghost" size="icon" onClick={() => router.push(`/challans/${c.id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDuplicate(c)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setChallanToDelete(c); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Challans"
        description={`Manage delivery challans for ${selectedCompany.name}`}
        action={
          <Button onClick={() => router.push("/challans/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Challan
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="xl:col-span-2" />
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(!v || v === "all" ? "" : v as ChallanStatus)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={customerFilter || "all"} onValueChange={(v) => setCustomerFilter(!v || v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Customer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Input placeholder="Broker" value={brokerFilter} onChange={(e) => setBrokerFilter(e.target.value)} className="xl:col-span-2" />
        </CardContent>
      </Card>

      <DataTable
        data={challans}
        columns={columns}
        searchValue={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        hideSearch
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Challan"
        description={`Are you sure you want to delete challan ${challanToDelete?.challan_number}?`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
