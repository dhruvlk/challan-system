"use client"

import { useState, useEffect } from "react"
import { useCompany } from "@/components/company-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, PlusCircle } from "lucide-react"
import { Payment, Customer } from "@/types"
import { getCustomers } from "@/services/customers.service"

interface PaymentFormDialogProps {
  onPaymentSaved: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => Promise<void> | void
  initialData?: Payment
  trigger?: React.ReactElement
}

export function PaymentFormDialog({ onPaymentSaved, initialData, trigger }: PaymentFormDialogProps) {
  const { selectedCompany } = useCompany()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    if (open && selectedCompany) {
      getCustomers(selectedCompany.id).then(setCustomers).catch(() => {})
    }
  }, [open, selectedCompany])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCompany) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'> = {
        company_id: selectedCompany.id,
        customer_id: formData.get("customer_id") as string,
        invoice_number: (formData.get("invoice_number") as string) || undefined,
        payment_date: formData.get("payment_date") as string,
        payment_method: formData.get("payment_method") as Payment['payment_method'],
        amount_received: Number(formData.get("amount_received")),
        reference_number: (formData.get("reference_number") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
        status: formData.get("status") as Payment['status'],
      }

      await onPaymentSaved(payment)
      toast.success(initialData ? "Payment updated." : "Payment recorded.")
      setOpen(false)
    } catch {
      toast.error("Failed to save payment.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Receive Payment
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Payment" : "Receive Payment"}</DialogTitle>
          <DialogDescription>Record a payment for {selectedCompany?.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer *</Label>
            <Select name="customer_id" defaultValue={initialData?.customer_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input id="payment_date" name="payment_date" type="date" required defaultValue={initialData?.payment_date || new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number (Optional)</Label>
              <Input id="invoice_number" name="invoice_number" defaultValue={initialData?.invoice_number || ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_received">Amount Received *</Label>
              <Input id="amount_received" name="amount_received" type="number" step="0.01" required defaultValue={initialData?.amount_received || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select name="payment_method" defaultValue={initialData?.payment_method || "Bank Transfer"} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="RTGS">RTGS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={initialData?.status || "Paid"} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input id="reference_number" name="reference_number" defaultValue={initialData?.reference_number || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={initialData?.notes || ""} />
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
