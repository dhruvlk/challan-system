"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { PartyFormDialog } from "@/components/parties/party-form-dialog"
import { Pencil, Trash2, Users } from "lucide-react"
import {
  getCustomersPaginated,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customers.service"
import { getChallans } from "@/services/challans.service"
import { Customer } from "@/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"

export default function PartiesClient() {
  const { selectedCompany } = useCompany()
  const [parties, setParties] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [partyToDelete, setPartyToDelete] = useState<Customer | null>(null)
  const pageSize = 10

  const loadParties = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const result = await getCustomersPaginated(selectedCompany.id, search, { page, pageSize })
      setParties(result.data)
      setTotal(result.total)
    } catch {
      toast.error("Failed to load customers")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadParties()
  }, [selectedCompany, search, page])

  const handlePartyAddedOrUpdated = async (updatedParty: Customer) => {
    if (updatedParty.id && parties.find((p) => p.id === updatedParty.id)) {
      await updateCustomer(updatedParty)
    } else {
      await addCustomer(updatedParty)
    }
    await loadParties()
  }

  const confirmDelete = async () => {
    if (!partyToDelete || !selectedCompany) return

    try {
      const challans = await getChallans(selectedCompany.id)
      const isLinked = challans.some((c) => c.customer_id === partyToDelete.id)

      if (isLinked) {
        toast.error("This customer cannot be deleted because it is linked to existing challans.")
      } else {
        await deleteCustomer(partyToDelete.id)
        toast.success("Customer deleted successfully.")
        await loadParties()
      }
    } catch {
      toast.error("Failed to delete customer")
    }
    setDeleteDialogOpen(false)
    setPartyToDelete(null)
  }

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={Users}
        title="Select a company"
        description="Choose a company from the header to manage customers."
      />
    )
  }

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Customer, className: "font-medium" },
    { header: "Mobile", cell: (p: Customer) => p.mobile || "-" },
    { header: "Email", cell: (p: Customer) => p.email || "-" },
    { header: "Broker", cell: (p: Customer) => p.broker || "-" },
    { header: "City", cell: (p: Customer) => p.city || "-" },
    { header: "GST Number", cell: (p: Customer) => p.gst_number || "-" },
    {
      header: "Actions",
      className: "text-right",
      cell: (p: Customer) => (
        <div className="flex justify-end gap-2">
          <PartyFormDialog
            initialData={p}
            onPartyAdded={handlePartyAddedOrUpdated}
            trigger={
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setPartyToDelete(p); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Customers"
        description={`Manage customers for ${selectedCompany.name}`}
        action={<PartyFormDialog onPartyAdded={handlePartyAddedOrUpdated} />}
      />

      <DataTable
        data={parties}
        columns={columns}
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        isLoading={isLoading}
        searchPlaceholder="Search by name, GST, mobile, broker..."
      />

      {total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${partyToDelete?.name}?`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
