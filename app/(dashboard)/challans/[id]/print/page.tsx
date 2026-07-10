import { PrintChallanView } from "@/components/challans"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Print Challan | Textile Challan Management",
  description: "Print your challan",
}

export default async function PrintChallanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <PrintChallanView id={resolvedParams.id} />
}
