import { ReportsView } from "@/components/reports"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reports | Textile Challan Management",
  description: "View reports and analytics",
}

export default function ReportsPage() {
  return <ReportsView />
}
