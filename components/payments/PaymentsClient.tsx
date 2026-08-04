"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { PaymentFormDialog } from "@/components/payments/PaymentForm"
import { Pencil, Trash2, CreditCard } from "lucide-react"
import { getPaymentsPaginated, addPayment, updatePayment, deletePayment } from "@/services/local/payments.service"
import { getCustomers } from "@/services/customers.service"
import { addAuditLog } from "@/services/local/audit.service"
import { Payment, Customer } from "@/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { StatusBadge } from "@/components/ui/status-badge"
import { PaymentCard } from "./PaymentCard"
import { LedgerTable } from "./LedgerTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PaymentsClient() {
  const { selectedCompany } = useCompany()
  const [payments, setPayments] = useState<Payment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const loadData = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const [paymentsData, customersData] = await Promise.all([
        getPaymentsPaginated(selectedCompany.id, search, { page, pageSize: 10 }),
        getCustomers(selectedCompany.id)
      ])
      
      const mappedPayments = paymentsData.data.map(p => ({
        ...p,
        customer: customersData.find(c => c.id === p.customer_id)
      }))
      
      setPayments(mappedPayments)
      setTotal(paymentsData.total)
      setCustomers(customersData)
    } catch {
      toast.error("Failed to load payments")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCompany, search, page])

  const handlePaymentSaved = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    let savedPayment;
    if (paymentData.id) {
      savedPayment = await updatePayment(paymentData as Payment)
      addAuditLog({
        company_id: selectedCompany!.id,
        module: 'Payments',
        action_type: 'Edit',
        record_name: `Payment ${paymentData.id.slice(0, 8)}`,
        performed_by: 'User',
      })
    } else {
      savedPayment = await addPayment(paymentData as Omit<Payment, 'id' | 'created_at'>)
      addAuditLog({
        company_id: selectedCompany!.id,
        module: 'Payments',
        action_type: 'Create',
        record_name: `Payment ${savedPayment.id.slice(0, 8)}`,
        performed_by: 'User',
      })
    }
    await loadData()
  }

  const confirmDelete = async () => {
    if (!paymentToDelete || !selectedCompany) return
    try {
      await deletePayment(paymentToDelete.id)
      addAuditLog({
        company_id: selectedCompany.id,
        module: 'Payments',
        action_type: 'Delete',
        record_name: `Payment ${paymentToDelete.id.slice(0, 8)}`,
        performed_by: 'User',
      })
      toast.success("Payment deleted.")
      await loadData()
    } catch {
      toast.error("Failed to delete payment")
    }
    setDeleteDialogOpen(false)
    setPaymentToDelete(null)
  }

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Select a company"
        description="Choose a company from the header to manage payments."
      />
    )
  }

  const columns = [
    { header: "Date", accessorKey: "payment_date" as keyof Payment, className: "font-medium" },
    { header: "Customer", cell: (p: Payment) => p.customer?.name || "Unknown" },
    { header: "Invoice", cell: (p: Payment) => p.invoice_number || "-" },
    { header: "Method", accessorKey: "payment_method" as keyof Payment },
    { header: "Amount", cell: (p: Payment) => `₹${p.amount_received.toFixed(2)}` },
    { 
      header: "Status", 
      cell: (p: Payment) => (
        <StatusBadge status={p.status} />
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (p: Payment) => (
        <div className="flex justify-end gap-2">
          <PaymentFormDialog
            initialData={p}
            onPaymentSaved={(data) => handlePaymentSaved({ ...data, id: p.id })}
            trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>}
          />
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setPaymentToDelete(p); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const totalReceived = payments.reduce((acc, p) => p.status === 'Paid' ? acc + p.amount_received : acc, 0)
  const pendingAmount = payments.reduce((acc, p) => p.status === 'Pending' ? acc + p.amount_received : acc, 0)
  const thisMonthAmount = payments.filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth()).reduce((acc, p) => acc + p.amount_received, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description={`Manage payments for ${selectedCompany.name}`}
        action={<PaymentFormDialog onPaymentSaved={handlePaymentSaved} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentCard title="Total Received" value={`₹${totalReceived.toFixed(2)}`} icon={CreditCard} />
        <PaymentCard title="Pending Payments" value={`₹${pendingAmount.toFixed(2)}`} icon={CreditCard} />
        <PaymentCard title="This Month Collection" value={`₹${thisMonthAmount.toFixed(2)}`} icon={CreditCard} />
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Payments History</TabsTrigger>
          <TabsTrigger value="ledger">Customer Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-4">
          <DataTable
            data={payments}
            columns={columns}
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
            searchPlaceholder="Search payments..."
          />
        </TabsContent>
        <TabsContent value="ledger" className="mt-4">
          <LedgerTable payments={payments} customers={customers} />
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Payment"
        description={`Delete this payment? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
