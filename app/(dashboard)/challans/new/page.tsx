import { NewChallanView } from "@/components/challans"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Challan | Textile Challan Management",
  description: "Create a new delivery challan",
}

export default function NewChallanPage() {
  return <NewChallanView />
}
