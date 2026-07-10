"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Company } from "@/types"
import { updateCompany } from "@/services/companies.service"

const companySchema = z.object({
  name: z.string().min(1, "Company Name is required"),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  bank_details: z.string().optional(),
})


export default function CompanyEditClient({ id }: { id: string }) {
  const router = useRouter()
  const { companies, setCompanies, selectedCompany, setSelectedCompany } = useCompany()
  const [isLoading, setIsLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      gst_number: "",
      pan_number: "",
      phone: "",
      email: "",
      address: "",
      bank_details: "",
    }
  })

  useEffect(() => {
    const found = companies.find((c) => c.id === id)
    if (found) {
      setCompany(found)
      form.reset({
        name: found.name || "",
        gst_number: found.gst_number || "",
        pan_number: found.pan_number || "",
        phone: found.phone || "",
        email: found.email || "",
        address: found.address || "",
        bank_details: found.bank_details || "",
      })
    } else if (companies.length > 0) {
      toast.error("Company not found")
      router.push("/companies")
    }
  }, [id, companies, router, form])

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    if (!company) return
    
    setIsLoading(true)

    try {
      const updatedCompany = {
        ...company,
        name: values.name,
        gst_number: values.gst_number || null,
        address: values.address || null,
        phone: values.phone || null,
        email: values.email || null,
        pan_number: values.pan_number || null,
        bank_details: values.bank_details || null,
      }

      await updateCompany(updatedCompany)
      toast.success("Company updated successfully!")
      
      const newCompanies = companies.map(c => c.id === company.id ? updatedCompany : c)
      setCompanies(newCompanies)
      
      if (selectedCompany?.id === company.id) {
        setSelectedCompany(updatedCompany)
      }
      
      form.reset(values)
      router.push("/companies")
    } catch (error) {
      toast.error("Failed to update company")
    } finally {
      setIsLoading(false)
    }
  }

  const { isDirty, isValid } = form.formState
  const isSubmitDisabled = isLoading || !isDirty || !isValid

  if (!company) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Company</CardTitle>
          <CardDescription>
            Update the details for {company.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g. Acme Textiles" />
                {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input id="gst_number" {...form.register("gst_number")} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input id="pan_number" {...form.register("pan_number")} placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...form.register("phone")} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" {...form.register("email")} type="email" placeholder="Optional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" {...form.register("address")} placeholder="Optional" className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_details">Bank Details</Label>
                <Textarea 
                  id="bank_details" 
                  {...form.register("bank_details")} 
                  placeholder="Bank Name, Account Number, IFSC Code (Optional)" 
                  className="min-h-[100px]" 
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled} className={isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
