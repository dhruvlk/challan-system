import { EditChallanView } from "@/components/challans"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Challan | Textile Challan Management",
  description: "Edit your challan",
}

export default async function EditChallanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <EditChallanView id={resolvedParams.id} />
}
