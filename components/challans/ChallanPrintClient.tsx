"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getChallanById } from "@/services/challans.service"
import { getCompanies } from "@/services/companies.service"
import { Challan } from "@/types"
import { ChallanPDF } from "@/components/pdf/ChallanPDF"
import dynamic from "next/dynamic"

// Dynamically import PDFViewer to avoid SSR hydration issues with react-pdf
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <p className="text-muted-foreground animate-pulse">Loading PDF Viewer...</p>
      </div>
    ),
  }
)

export default function ChallanPrintClient({ id }: { id: string }) {
  const router = useRouter()
  const [challan, setChallan] = useState<Challan | null>(null)
  const [company, setCompany] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (id) {
        const found = await getChallanById(id as string)
        if (found) {
          setChallan(found)
          const companies = await getCompanies()
          setCompany(companies.find(c => c.id === found.company_id))
        }
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!challan || !company || !challan.party || !challan.items) {
    return <div className="flex h-screen items-center justify-center">Challan not found</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          Note: Use the built-in PDF viewer controls to print or download.
        </div>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border shadow-sm bg-white">
        <PDFViewer width="100%" height="100%" className="border-none">
          <ChallanPDF challan={challan} company={company} party={challan.party} />
        </PDFViewer>
      </div>
    </div>
  )
}
