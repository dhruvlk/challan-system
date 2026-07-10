import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Challan, Company } from "@/types"
import { ChallanPDF } from "@/components/pdf/ChallanPDF"

interface DownloadButtonProps {
  challan: Challan
  company: Company
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function DownloadChallanButton({ challan, company, variant = "ghost", size = "icon", showText = false }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    if (isGenerating) return

    try {
      setIsGenerating(true)
      toast.info("Generating PDF...", { id: "pdf-gen" })

      // Dynamically import to avoid Next.js SSR issues with react-pdf
      const { pdf } = await import("@react-pdf/renderer")

      // Generate the PDF blob
      const blob = await pdf(
        <ChallanPDF challan={challan} company={company} party={challan.customer ?? challan.party} />
      ).toBlob()

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      
      // Determine filename
      const filename = challan.challan_number 
        ? `Challan-${challan.challan_number}.pdf` 
        : "Challan.pdf"
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("PDF downloaded successfully.", { id: "pdf-gen" })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-gen" })
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
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">{isGenerating ? "Generating..." : "Download PDF"}</span>
      )}
    </Button>
  )
}
