import { DashboardView } from "@/components/dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Textile Challan Management",
  description: "Dashboard overview",
}

export default function DashboardPage() {
  return <DashboardView />
}
