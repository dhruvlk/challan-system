import { CompaniesView } from "@/components/companies"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Companies | Textile Challan Management",
  description: "Manage your companies",
}

export default function CompaniesPage() {
  return <CompaniesView />
}
