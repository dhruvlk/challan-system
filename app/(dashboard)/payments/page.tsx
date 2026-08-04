import PaymentsClient from "@/components/payments/PaymentsClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payments | Textile Challan Management System",
  description: "Manage payments and customer ledgers",
}

export default function PaymentsPage() {
  return <PaymentsClient />
}
