"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Company, DeliveryChallan } from "@/types"
import { DeliveryChallanPDF } from "@/components/pdf/DeliveryChallanPDF"
import { getDeliveryChallanById } from "@/services/delivery-challans.service"

interface DownloadButtonProps {
  challan: DeliveryChallan
  company: Company
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function DownloadDeliveryChallanButton({
  challan,
  company,
  variant = "ghost",
  size = "icon",
  showText = false,
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isGenerating) return

    try {
      setIsGenerating(true)
      toast.info("Generating PDF...", { id: "dc-pdf-gen" })

      // Always load the latest challan + items before rendering
      const latest = await getDeliveryChallanById(challan.id)
      if (!latest) {
        throw new Error("Delivery challan not found")
      }

      const { pdf } = await import("@react-pdf/renderer")
      const blob = await pdf(
        <DeliveryChallanPDF
          challan={latest}
          company={company}
          party={latest.customer}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = latest.challan_number
        ? `Delivery-Challan-${latest.challan_number}.pdf`
        : "Delivery-Challan.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("PDF downloaded successfully.", { id: "dc-pdf-gen" })
    } catch (error) {
      console.error("Error generating delivery challan PDF:", error)
      toast.error("Failed to generate PDF. Please try again.", { id: "dc-pdf-gen" })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating}
      title="Download PDF"
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {showText && (
        <span className="ml-2">{isGenerating ? "Generating..." : "Download PDF"}</span>
      )}
    </Button>
  )
}
