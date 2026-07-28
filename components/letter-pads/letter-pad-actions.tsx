"use client"

import { useState } from "react"
import { Eye, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { LetterPad } from "@/types"
import { useCompany } from "@/components/company-provider"
import { LetterPadPDF } from "@/components/pdf/LetterPadPDF"
import { buildPdfFilename } from "@/lib/pdf-utils"
import { downloadPdfBlob, previewPdfBlob } from "@/lib/pdf-actions"

export function LetterPadActions({ letter }: { letter: LetterPad }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { selectedCompany } = useCompany()

  const generate = async () => {
    if (!selectedCompany) throw new Error("No company selected")
    const { pdf } = await import("@react-pdf/renderer")
    const blob = await pdf(
      <LetterPadPDF letterPad={letter} company={selectedCompany} />
    ).toBlob()
    return blob
  }

  const run = async (action: "preview" | "download") => {
    if (isGenerating) return
    try {
      setIsGenerating(true)
      toast.info("Generating PDF...", { id: "lp-pdf-gen" })
      const blob = await generate()
      const filename = buildPdfFilename("Letter-Pad", letter.title)
      
      if (action === "preview") {
        await previewPdfBlob(blob)
        toast.success("PDF opened.", { id: "lp-pdf-gen" })
      } else {
        await downloadPdfBlob(blob, filename)
        toast.success("PDF downloaded.", { id: "lp-pdf-gen" })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF.", { id: "lp-pdf-gen" })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <DropdownMenuItem onClick={() => run("preview")}>
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Eye className="mr-2 h-4 w-4" />
        )}
        Preview PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => run("download")}>
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </DropdownMenuItem>
    </>
  )
}
