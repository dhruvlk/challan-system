"use client"

import { useEffect, useState } from "react"
import { useCompany } from "@/components/company-provider"
import { ExpenseFormDialog } from "@/components/expenses/ExpenseForm"
import { Pencil, Trash2, Wallet } from "lucide-react"
import { getExpensesPaginated, addExpense, updateExpense, deleteExpense, getExpenses } from "@/services/local/expenses.service"
import { addAuditLog } from "@/services/local/audit.service"
import { Expense } from "@/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { StatusBadge } from "@/components/ui/status-badge"
import { ExpenseCard } from "./ExpenseCard"
import { ExpenseCharts } from "./ExpenseCharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExpensesClient() {
  const { selectedCompany } = useCompany()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const loadData = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const data = await getExpensesPaginated(selectedCompany.id, search, { page, pageSize: 10 })
      const allData = await getExpenses(selectedCompany.id)
      setExpenses(data.data)
      setTotal(data.total)
      setAllExpenses(allData)
    } catch {
      toast.error("Failed to load expenses")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCompany, search, page])

  const handleExpenseSaved = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    let savedExpense;
    if (expenseData.id) {
      savedExpense = await updateExpense(expenseData as Expense)
      addAuditLog({
        company_id: selectedCompany!.id,
        module: 'Expenses',
        action_type: 'Edit',
        record_name: `Expense ${expenseData.id.slice(0, 8)}`,
        performed_by: 'User',
      })
    } else {
      savedExpense = await addExpense(expenseData as Omit<Expense, 'id' | 'created_at'>)
      addAuditLog({
        company_id: selectedCompany!.id,
        module: 'Expenses',
        action_type: 'Create',
        record_name: `Expense ${savedExpense.id.slice(0, 8)}`,
        performed_by: 'User',
      })
    }
    await loadData()
  }

  const confirmDelete = async () => {
    if (!expenseToDelete || !selectedCompany) return
    try {
      await deleteExpense(expenseToDelete.id)
      addAuditLog({
        company_id: selectedCompany.id,
        module: 'Expenses',
        action_type: 'Delete',
        record_name: `Expense ${expenseToDelete.id.slice(0, 8)}`,
        performed_by: 'User',
      })
      toast.success("Expense deleted.")
      await loadData()
    } catch {
      toast.error("Failed to delete expense")
    }
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={Wallet}
        title="Select a company"
        description="Choose a company from the header to manage expenses."
      />
    )
  }

  const columns = [
    { header: "Date", accessorKey: "expense_date" as keyof Expense, className: "font-medium" },
    { header: "Category", accessorKey: "category" as keyof Expense },
    { header: "Paid To", cell: (e: Expense) => e.paid_to || "-" },
    { header: "Amount", cell: (e: Expense) => `₹${e.amount.toFixed(2)}` },
    { header: "Method", accessorKey: "payment_method" as keyof Expense },
    { 
      header: "Status", 
      cell: (e: Expense) => (
        <StatusBadge status={e.status} />
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (e: Expense) => (
        <div className="flex justify-end gap-2">
          <ExpenseFormDialog
            initialData={e}
            onExpenseSaved={(data) => handleExpenseSaved({ ...data, id: e.id })}
            trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>}
          />
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setExpenseToDelete(e); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const today = new Date().toISOString().split('T')[0]
  const todayAmount = allExpenses.filter(e => e.expense_date === today).reduce((acc, e) => acc + e.amount, 0)
  const monthAmount = allExpenses.filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth()).reduce((acc, e) => acc + e.amount, 0)
  const yearAmount = allExpenses.filter(e => new Date(e.expense_date).getFullYear() === new Date().getFullYear()).reduce((acc, e) => acc + e.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description={`Manage expenses for ${selectedCompany.name}`}
        action={<ExpenseFormDialog onExpenseSaved={handleExpenseSaved} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ExpenseCard title="Today's Expense" value={`₹${todayAmount.toFixed(2)}`} icon={Wallet} />
        <ExpenseCard title="Monthly Expense" value={`₹${monthAmount.toFixed(2)}`} icon={Wallet} />
        <ExpenseCard title="Yearly Expense" value={`₹${yearAmount.toFixed(2)}`} icon={Wallet} />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Expenses List</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <DataTable
            data={expenses}
            columns={columns}
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
            searchPlaceholder="Search expenses..."
          />
        </TabsContent>
        <TabsContent value="charts" className="mt-4">
          <ExpenseCharts expenses={allExpenses} />
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Expense"
        description={`Delete this expense? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
