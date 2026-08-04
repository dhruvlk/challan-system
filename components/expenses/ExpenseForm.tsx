"use client"

import { useState } from "react"
import { useCompany } from "@/components/company-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, PlusCircle } from "lucide-react"
import { Expense } from "@/types"

interface ExpenseFormDialogProps {
  onExpenseSaved: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void> | void
  initialData?: Expense
  trigger?: React.ReactElement
}

export function ExpenseFormDialog({ onExpenseSaved, initialData, trigger }: ExpenseFormDialogProps) {
  const { selectedCompany } = useCompany()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCompany) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'> = {
        company_id: selectedCompany.id,
        expense_date: formData.get("expense_date") as string,
        category: formData.get("category") as Expense['category'],
        amount: Number(formData.get("amount")),
        paid_to: (formData.get("paid_to") as string) || undefined,
        payment_method: formData.get("payment_method") as Expense['payment_method'],
        description: (formData.get("description") as string) || undefined,
        bill_number: (formData.get("bill_number") as string) || undefined,
        remarks: (formData.get("remarks") as string) || undefined,
        status: formData.get("status") as Expense['status'],
      }

      await onExpenseSaved(expense)
      toast.success(initialData ? "Expense updated." : "Expense recorded.")
      setOpen(false)
    } catch {
      toast.error("Failed to save expense.")
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    'Office Expense', 'Transport', 'Labour', 'Electricity', 
    'Fuel', 'Stationery', 'Maintenance', 'Internet', 'Salary', 'Other'
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>Record a new expense for {selectedCompany?.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_date">Date *</Label>
              <Input id="expense_date" name="expense_date" type="date" required defaultValue={initialData?.expense_date || new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" defaultValue={initialData?.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required defaultValue={initialData?.amount || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_to">Paid To (Vendor / Person)</Label>
              <Input id="paid_to" name="paid_to" defaultValue={initialData?.paid_to || ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select name="payment_method" defaultValue={initialData?.payment_method || "Cash"} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={initialData?.status || "Paid"} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bill_number">Bill / Ref Number</Label>
              <Input id="bill_number" name="bill_number" defaultValue={initialData?.bill_number || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
