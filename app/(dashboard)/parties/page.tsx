import { PartiesView } from "@/components/parties"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers | Textile Challan Management",
  description: "Manage your customers and parties",
}

export default function PartiesPage() {
  return <PartiesView />
}
