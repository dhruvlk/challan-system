"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { addCompany } from "@/services/companies.service"

export default function CompanyNewClient() {
  const router = useRouter()
  const { companies, setCompanies, setSelectedCompany } = useCompany()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const newCompany = {
        id: `comp-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.get("name") as string,
        logo_url: null,
        gst_number: formData.get("gst_number") as string || null,
        address: formData.get("address") as string || null,
        phone: formData.get("phone") as string || null,
        email: formData.get("email") as string || null,
        pan_number: formData.get("pan_number") as string || null,
        bank_details: formData.get("bank_details") as string || null,
        signature_url: null,
      }

      await addCompany(newCompany)
      toast.success("Company created successfully!")
      
      const newCompanies = [newCompany, ...companies]
      setCompanies(newCompanies)
      setSelectedCompany(newCompany)
      router.push("/companies")
    } catch (error) {
      toast.error("Failed to create company")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
          <CardDescription>
            Enter the details of the new company to manage its challans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. Acme Textiles" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input id="gst_number" name="gst_number" placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input id="pan_number" name="pan_number" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="Optional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" placeholder="Optional" className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_details">Bank Details</Label>
                <Textarea 
                  id="bank_details" 
                  name="bank_details" 
                  placeholder="Bank Name, Account Number, IFSC Code (Optional)" 
                  className="min-h-[100px]" 
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Company"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
