"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Eye, Printer, Edit, Copy, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getChallans, deleteChallan, addChallan } from "@/services/challans.service"
import { Challan } from "@/types"
import { DownloadChallanButton } from "@/components/challans/download-button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function ChallansClient() {
  const { selectedCompany } = useCompany()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [allChallans, setAllChallans] = useState<Challan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [challanToDelete, setChallanToDelete] = useState<Challan | null>(null)

  const loadChallans = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const data = await getChallans()
      setAllChallans(data)
    } catch (error) {
      toast.error("Failed to load challans")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadChallans()
  }, [selectedCompany])

  const challans = selectedCompany ? allChallans
    .filter(c => c.company_id === selectedCompany.id)
    .sort((a, b) => {
      // 1. Created Date (Newest First)
      const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date).getTime();
      const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date).getTime();

      const dateDiff = dateB - dateA;
      if (dateDiff !== 0) return dateDiff;

      // 2. If created dates are the same, use Challan Number (Highest First)
      return b.challan_number.localeCompare(a.challan_number);
    }) : []

  const filteredChallans = challans.filter(c =>
    c.challan_number.toLowerCase().includes(search.toLowerCase()) ||
    (c.party?.name && c.party.name.toLowerCase().includes(search.toLowerCase()))
  )

  const confirmDelete = async () => {
    if (!challanToDelete) return
    await deleteChallan(challanToDelete.id)
    toast.success("Challan deleted successfully.")
    await loadChallans()
    setDeleteDialogOpen(false)
    setChallanToDelete(null)
  }

  const handleDeleteClick = (challan: Challan) => {
    setChallanToDelete(challan)
    setDeleteDialogOpen(true)
  }

  const handleDuplicate = async (challan: Challan) => {
    try {
      const allC = await getChallans()
      const companyChallans = allC.filter(c => c.company_id === selectedCompany?.id)

      let nextNumber = 1
      if (companyChallans.length > 0) {
        const challanNumbers = companyChallans.map(c => {
          const num = parseInt(c.challan_number.split('-').pop() || '0')
          return isNaN(num) ? 0 : num
        })
        nextNumber = Math.max(...challanNumbers) + 1
      }

      const year = new Date().getFullYear().toString().slice(-2)
      const prefix = selectedCompany?.name.substring(0, 3).toUpperCase() || "CHL"
      const newChallanNumber = `${prefix}-${year}-${nextNumber.toString().padStart(3, '0')}`

      const newChallan: Challan = {
        ...challan,
        id: `cha-${Date.now()}`,
        challan_number: newChallanNumber,
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await addChallan(newChallan)
      toast.success("Challan duplicated successfully.")
      await loadChallans()
    } catch (error) {
      toast.error("Failed to duplicate challan")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-gray-500'
      case 'pending': return 'bg-amber-500'
      case 'delivered': return 'bg-emerald-500'
      case 'returned': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'Draft'
      case 'pending': return 'Pending'
      case 'delivered': return 'Delivered'
      case 'returned': return 'Returned'
      case 'cancelled': return 'Cancelled'
      default: return status || 'Draft'
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
    { header: "Party", cell: (c: Challan) => c.party?.name || "-" },
    { header: "Items", cell: (c: Challan) => c.items?.length || 0 },
    {
      header: "Status",
      cell: (c: Challan) => (
        <Badge className={`${getStatusColor(c.status)} hover:${getStatusColor(c.status)}`}>
          {getDisplayStatus(c.status)}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (c: Challan) => (
        <div className="flex justify-end gap-1">
          <DownloadChallanButton challan={c} company={selectedCompany} />
          <Button variant="ghost" size="icon" onClick={() => router.push(`/challans/${c.id}/edit`)}>
            <Edit className="h-4 w-4 text-blue-600" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(c)}>
            <Trash2 className="h-4 w-4 text-red-600" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Challans"
        description={`Manage delivery challans for ${selectedCompany.name}`}
        action={
          <Button onClick={() => router.push('/challans/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Challan
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <DataTable
          data={filteredChallans}
          columns={columns}
          searchPlaceholder="Search challans..."
          searchValue={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
          emptyMessage="No challans found."
        />
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Challan"
        description="Are you sure you want to delete this challan? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
