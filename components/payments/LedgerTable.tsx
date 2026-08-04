import { Payment, Customer } from "@/types"
import { DataTable } from "@/components/tables/DataTable"
import { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LedgerTableProps {
  payments: Payment[]
  customers: Customer[]
}

export function LedgerTable({ payments, customers }: LedgerTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all")

  const ledgerData = useMemo(() => {
    let customerPayments = payments;
    if (selectedCustomerId !== "all") {
      customerPayments = payments.filter(p => p.customer_id === selectedCustomerId)
    }

    let balance = 0;
    return customerPayments.map(p => {
      balance += p.amount_received; // Simplified running balance
      return {
        ...p,
        running_balance: balance
      }
    })
  }, [payments, selectedCustomerId])

  const columns = [
    { header: "Date", accessorKey: "payment_date" as keyof Payment, className: "font-medium" },
    { header: "Customer", cell: (p: Payment & { running_balance: number }) => p.customer?.name || "Unknown" },
    { header: "Invoice No", cell: (p: Payment & { running_balance: number }) => p.invoice_number || "-" },
    { header: "Received Amount", cell: (p: Payment & { running_balance: number }) => `₹${p.amount_received.toFixed(2)}`, className: "text-green-600" },
    { header: "Running Balance", cell: (p: Payment & { running_balance: number }) => `₹${p.running_balance.toFixed(2)}`, className: "font-bold" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedCustomerId} onValueChange={(val) => setSelectedCustomerId(val || "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        data={ledgerData}
        columns={columns}
      />
    </div>
  )
}
