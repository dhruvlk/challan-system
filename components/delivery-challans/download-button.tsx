"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Eye, Loader2, Share2 } from "lucide-react"
import { toast } from "sonner"
import type { Company, DeliveryChallan } from "@/types"
import { DeliveryChallanPDF } from "@/components/pdf/DeliveryChallanPDF"
import { getDeliveryChallanById } from "@/services/delivery-challans.service"
import { buildPdfFilename } from "@/lib/pdf-utils"
import { downloadPdfBlob, previewPdfBlob, sharePdfBlob } from "@/lib/pdf-actions"

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

  const generate = async () => {
    const latest = await getDeliveryChallanById(challan.id)
    if (!latest) throw new Error("Delivery challan not found")
    const { pdf } = await import("@react-pdf/renderer")
    const blob = await pdf(
      <DeliveryChallanPDF challan={latest} company={company} party={latest.customer} />
    ).toBlob()
    return { blob, latest }
  }

  const run = async (action: "download" | "preview" | "share", e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (isGenerating) return
    try {
      setIsGenerating(true)
      toast.info("Generating PDF...", { id: "dc-pdf-gen" })
      const { blob, latest } = await generate()
      const filename = buildPdfFilename(
        "Delivery-Challan",
        latest.challan_number,
        latest.customer?.name
      )
      if (action === "preview") {
        await previewPdfBlob(blob)
        toast.success("PDF opened.", { id: "dc-pdf-gen" })
      } else if (action === "share") {
        const shared = await sharePdfBlob(
          blob,
          filename,
          `Delivery Challan ${latest.challan_number}`
        )
        toast.success(shared ? "PDF shared." : "PDF downloaded.", { id: "dc-pdf-gen" })
      } else {
        await downloadPdfBlob(blob, filename)
        toast.success("PDF downloaded successfully.", { id: "dc-pdf-gen" })
      }
    } catch (error) {
      console.error("Error generating delivery challan PDF:", error)
      toast.error("Failed to generate PDF. Please try again.", { id: "dc-pdf-gen" })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="inline-flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant={variant}
              size={size}
              disabled={isGenerating}
              title="PDF actions"
              className={size === "icon" ? "size-8" : undefined}
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {showText && <span className="ml-2">PDF</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => run("preview")}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("download")}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("share")}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
