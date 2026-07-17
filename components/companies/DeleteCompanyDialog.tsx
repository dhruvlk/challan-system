"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Trash2, AlertTriangle, Archive } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { checkCompanyData, deleteCompany, archiveCompany } from "@/services/companies.service"
import { useCompany } from "@/components/company-provider"
import type { Company } from "@/types"

interface DeleteCompanyDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteCompanyDialog({
  company,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCompanyDialogProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasData, setHasData] = useState<boolean | null>(null)
  
  const { selectedCompany, setSelectedCompany, companies, refreshCompanies } = useCompany()

  useEffect(() => {
    if (open && company) {
      setHasData(null)
      setIsChecking(true)
      checkCompanyData(company.id)
        .then((result) => setHasData(result))
        .catch((error) => {
          console.error("Failed to check company data:", error)
          toast.error("Failed to verify company data")
          onOpenChange(false)
        })
        .finally(() => setIsChecking(false))
    } else {
      setHasData(null)
      setIsChecking(false)
      setIsProcessing(false)
    }
  }, [open, company, onOpenChange])

  const handlePostAction = async () => {
    await refreshCompanies()
    if (selectedCompany?.id === company?.id) {
      // Find another active company if the selected one was deleted/archived
      const otherCompany = companies.find(c => c.id !== company?.id)
      setSelectedCompany(otherCompany || null)
    }
    onSuccess()
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!company) return
    setIsProcessing(true)
    try {
      await deleteCompany(company.id)
      toast.success("Company permanently deleted")
      await handlePostAction()
    } catch (error: unknown) {
      console.error("Failed to delete company:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete company")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleArchive = async () => {
    if (!company) return
    setIsProcessing(true)
    try {
      await archiveCompany(company.id)
      toast.success("Company archived successfully")
      await handlePostAction()
    } catch (error: unknown) {
      console.error("Failed to archive company:", error)
      toast.error(error instanceof Error ? error.message : "Failed to archive company")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasData ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <Trash2 className="h-5 w-5 text-destructive" />
            )}
            Delete Company?
          </DialogTitle>
          <DialogDescription className="pt-2">
            {isChecking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                Checking for related business data...
              </span>
            ) : hasData ? (
              <span className="text-foreground font-medium">
                This company contains business data (customers, challans, stock, etc.) and cannot be permanently deleted.
              </span>
            ) : (
              <span>
                This action is permanent and cannot be undone. Are you sure you want to delete <strong className="text-foreground">{company.name}</strong>?
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isChecking && hasData && (
          <div className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            To prevent accidental data loss and maintain referential integrity, please archive the company instead. It will be hidden from normal lists.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing || isChecking}
          >
            Cancel
          </Button>
          {!isChecking && (
            hasData ? (
              <Button
                variant="default"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleArchive}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Archive Company
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Company
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
