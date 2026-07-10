import { EditCompanyView } from "@/components/companies"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Company | Textile Challan Management",
  description: "Edit company details",
}

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <EditCompanyView id={resolvedParams.id} />
}
