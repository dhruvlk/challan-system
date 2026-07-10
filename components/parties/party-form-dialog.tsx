"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCompany } from "@/components/company-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, PlusCircle } from "lucide-react"
import { Party } from "@/types"

const partySchema = z.object({
  name: z.string().min(1, "Party Name is required"),
  contact_person: z.string().optional(),
  mobile: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
})


interface PartyFormDialogProps {
  onPartyAdded: (party: Party) => Promise<void> | void
  initialData?: Party
  trigger?: React.ReactElement
}

export function PartyFormDialog({ onPartyAdded, initialData, trigger }: PartyFormDialogProps) {
  const { selectedCompany } = useCompany()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof partySchema>>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: initialData?.name || "",
      contact_person: initialData?.contact_person || "",
      mobile: initialData?.mobile || "",
      gst_number: initialData?.gst_number || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      pincode: initialData?.pincode || "",
      notes: initialData?.notes || "",
    }
  })

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        contact_person: initialData?.contact_person || "",
        mobile: initialData?.mobile || "",
        gst_number: initialData?.gst_number || "",
        address: initialData?.address || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
        pincode: initialData?.pincode || "",
        notes: initialData?.notes || "",
      })
    }
  }, [open, initialData, form])

  const onSubmit = async (values: z.infer<typeof partySchema>) => {
    if (!selectedCompany) return

    setIsLoading(true)
    try {
      const newParty: Party = {
        id: initialData ? initialData.id : `party-new-${Date.now()}`,
        company_id: initialData ? initialData.company_id : selectedCompany.id,
        name: values.name,
        contact_person: values.contact_person,
        mobile: values.mobile,
        gst_number: values.gst_number,
        address: values.address,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        notes: values.notes,
      }
      
      await onPartyAdded(newParty)
      toast.success(initialData ? "Party updated successfully." : "Party created successfully!")
      form.reset(values)
      setOpen(false)
    } catch (error) {
      toast.error("Failed to save party.")
    } finally {
      setIsLoading(false)
    }
  }

  const { isDirty, isValid } = form.formState
  const isSubmitDisabled = isLoading || !isDirty || !isValid

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Party
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Party" : "Add New Party"}</DialogTitle>
          <DialogDescription>
            {initialData ? `Edit details for ${initialData.name}` : `Create a new party/client for ${selectedCompany?.name}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Party Name *</Label>
            <Input id="name" {...form.register("name")} placeholder="XYZ Textiles" />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" {...form.register("contact_person")} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" {...form.register("mobile")} placeholder="+91 9876543210" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input id="gst_number" {...form.register("gst_number")} placeholder="22AAAAA0000A1Z5" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...form.register("address")} placeholder="123 Textile Market" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} placeholder="Surat" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...form.register("state")} placeholder="Gujarat" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...form.register("pincode")} placeholder="395002" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Any additional information..." />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} className={isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Party" : "Save Party"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
