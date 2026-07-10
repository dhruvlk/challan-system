"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { PartyFormDialog } from "@/components/parties/party-form-dialog"
import { Pencil, Trash2 } from "lucide-react"
import { getParties, addParty, updateParty, deleteParty } from "@/services/parties.service"
import { getChallans } from "@/services/challans.service"
import { Party } from "@/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { PageHeader } from "@/components/common/PageHeader"

export default function PartiesClient() {
  const { selectedCompany } = useCompany()
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null)

  const loadParties = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const data = await getParties()
      setParties(data.filter(p => p.company_id === selectedCompany.id))
    } catch (error) {
      toast.error("Failed to load parties")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadParties()
  }, [selectedCompany])

  const handlePartyAddedOrUpdated = async (updatedParty: Party) => {
    const existingParties = await getParties()
    const exists = existingParties.find(p => p.id === updatedParty.id)
    if (exists) {
      await updateParty(updatedParty)
    } else {
      await addParty(updatedParty)
    }
    await loadParties()
  }

  const handleDeleteClick = (party: Party) => {
    setPartyToDelete(party)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!partyToDelete) return

    const challans = await getChallans()
    const isLinked = challans.some(c => c.party_id === partyToDelete.id)

    if (isLinked) {
      toast.error("This party cannot be deleted because it is linked to existing challans.")
      setDeleteDialogOpen(false)
      setPartyToDelete(null)
      return
    }

    await deleteParty(partyToDelete.id)
    toast.success("Party deleted successfully.")
    await loadParties()
    setDeleteDialogOpen(false)
    setPartyToDelete(null)
  }

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.gst_number && p.gst_number.toLowerCase().includes(search.toLowerCase())) ||
    (p.city && p.city.toLowerCase().includes(search.toLowerCase()))
  )

  if (!selectedCompany) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Please select a company first.</p>
      </div>
    )
  }

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Party, className: "font-medium" },
    { header: "Contact Person", cell: (p: Party) => p.contact_person || "-" },
    { header: "Mobile", cell: (p: Party) => p.mobile || "-" },
    { header: "City", cell: (p: Party) => p.city || "-" },
    { header: "GST Number", cell: (p: Party) => p.gst_number || "-" },
    { 
      header: "Actions", 
      className: "text-right",
      cell: (p: Party) => (
        <div className="flex justify-end gap-2">
          <PartyFormDialog
            onPartyAdded={handlePartyAddedOrUpdated}
            initialData={p}
            trigger={
              <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit party</span>
              </Button>
            }
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteClick(p)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete party</span>
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Parties"
        description={`Manage clients for ${selectedCompany.name}`}
        action={<PartyFormDialog onPartyAdded={handlePartyAddedOrUpdated} />}
      />

      <div className="flex-1 overflow-auto">
        <DataTable
          data={filteredParties}
          columns={columns}
          searchPlaceholder="Search parties..."
          searchValue={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
          emptyMessage="No parties found."
        />
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Party"
        description="Are you sure you want to delete this party? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
