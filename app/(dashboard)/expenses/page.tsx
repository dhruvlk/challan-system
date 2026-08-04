import ExpensesClient from "@/components/expenses/ExpensesClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Expenses | Textile Challan Management System",
  description: "Manage company expenses",
}

export default function ExpensesPage() {
  return <ExpensesClient />
}
