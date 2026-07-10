import { NewCompanyView } from "@/components/companies"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Company | Textile Challan Management",
  description: "Create a new company",
}

export default function NewCompanyPage() {
  return <NewCompanyView />
}
