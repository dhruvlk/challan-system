"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Eye, Printer, Edit, Copy, Trash2 } from "lucide-react"
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

export function ChallansView() {
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
      case "Draft": return "bg-gray-500"
      case "Pending": return "bg-amber-500"
      case "Delivered": return "bg-emerald-500"
      case "Returned": return "bg-blue-500"
      case "Cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  if (!selectedCompany) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Please select a company first.</p>
      </div>
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
        <Badge className={`${getStatusColor(c.status)} text-white`}>{c.status}</Badge>
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
        title="Challans"
        description={`Manage delivery challans for ${selectedCompany.name}`}
        action={
          <Button onClick={() => router.push("/challans/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Challan
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="Search challan, customer, GST, broker..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(!v || v === "all" ? "" : v as ChallanStatus)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>
      <Input placeholder="Filter by broker" value={brokerFilter} onChange={(e) => setBrokerFilter(e.target.value)} className="max-w-sm" />

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
