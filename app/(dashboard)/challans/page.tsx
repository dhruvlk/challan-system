import { ChallansView } from "@/components/challans"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Challans | Textile Challan Management",
  description: "Manage your delivery challans",
}

export default function ChallansPage() {
  return <ChallansView />
}
