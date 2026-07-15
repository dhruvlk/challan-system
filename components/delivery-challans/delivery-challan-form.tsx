"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCompany } from "@/components/company-provider"
import { useAuth } from "@/hooks/useAuth"
import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { getCustomers } from "@/services/customers.service"
import {
  addDeliveryChallan,
  generateDeliveryChallanNumber,
  updateDeliveryChallan,
} from "@/services/delivery-challans.service"
import { getStocks, parseStockError } from "@/services/stocks.service"
import type { Customer, DeliveryChallan, DeliveryChallanStatus, Stock } from "@/types"

const itemSchema = z.object({
  taka_no: z.string().optional(),
  meters: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
})

const formSchema = z.object({
  challan_number: z.string().min(1, "Challan number is required"),
  date: z.string().min(1, "Date is required"),
  customer_id: z.string().min(1, "Customer is required"),
  stock_id: z.string().min(1, "Quality is required"),
  quality: z.string().optional(),
  broker: z.string().optional(),
  delivered_by: z.string().optional(),
  remarks: z.string().optional(),
  notes: z.string().optional(),
  status: z.string(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type FormValues = z.infer<typeof formSchema>

export function DeliveryChallanForm({ initialData }: { initialData?: DeliveryChallan }) {
  const router = useRouter()
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: initialData
      ? {
          challan_number: initialData.challan_number,
          date: initialData.date,
          customer_id: initialData.customer_id,
          stock_id: initialData.stock_id || "",
          quality: initialData.quality || "",
          broker: initialData.broker || "",
          delivered_by: initialData.delivered_by || "",
          remarks: initialData.remarks || "",
          notes: initialData.notes || "",
          status: initialData.status,
          items:
            initialData.items && initialData.items.length > 0
              ? initialData.items.map((item) => ({
                  taka_no: item.taka_no || "",
                  meters: item.meters || 0,
                  weight: item.weight || 0,
                }))
              : [{ taka_no: "", meters: 0, weight: 0 }],
        }
      : {
          challan_number: "",
          date: new Date().toISOString().split("T")[0],
          customer_id: "",
          stock_id: "",
          quality: "",
          broker: "",
          delivered_by: "",
          remarks: "",
          notes: "",
          status: "Draft",
          items: [{ taka_no: "", meters: 0, weight: 0 }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const items = form.watch("items")
  const customerId = form.watch("customer_id")
  const stockId = form.watch("stock_id")
  const selectedCustomer = customers.find((c) => c.id === customerId)
  const selectedStock = stocks.find((s) => s.id === stockId)
  const reservedPieces =
    isEditMode && initialData?.stock_id === stockId ? Number(initialData.total_pieces) || 0 : 0
  const availableForSale = selectedStock
    ? selectedStock.available_taka + reservedPieces
    : null

  const totals = {
    pieces: items?.length ?? 0,
    meters: (items ?? []).reduce((sum, item) => sum + (Number(item.meters) || 0), 0),
    weight: (items ?? []).reduce((sum, item) => sum + (Number(item.weight) || 0), 0),
  }

  useEffect(() => {
    async function loadData() {
      if (!selectedCompany) return
      setCustomers(await getCustomers(selectedCompany.id))
      try {
        setStocks(await getStocks(selectedCompany.id))
      } catch {
        toast.error("Failed to load stock qualities")
      }
    }
    loadData()
  }, [selectedCompany])

  useEffect(() => {
    async function loadNumber() {
      if (!isEditMode && selectedCompany && !form.getValues("challan_number")) {
        try {
          const number = await generateDeliveryChallanNumber(selectedCompany.id)
          form.setValue("challan_number", number)
        } catch {
          toast.error("Failed to generate delivery challan number")
        }
      }
    }
    loadNumber()
  }, [isEditMode, selectedCompany, form])

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany) return
    setIsSubmitting(true)

    try {
      const stock = stocks.find((s) => s.id === values.stock_id)
      if (!stock) {
        toast.error("Selected quality was not found in stock.")
        setIsSubmitting(false)
        return
      }

      const pieceCount = values.items.length
      const reserved =
        isEditMode && initialData?.stock_id === values.stock_id
          ? Number(initialData.total_pieces) || 0
          : 0
      const available = stock.available_taka + reserved
      if (pieceCount > available) {
        toast.error(`Only ${available} Taka Available.`)
        setIsSubmitting(false)
        return
      }

      const payload = {
        company_id: selectedCompany.id,
        customer_id: values.customer_id,
        challan_number: values.challan_number,
        date: values.date,
        stock_id: values.stock_id,
        quality: stock.quality_name,
        broker: values.broker || null,
        delivered_by: values.delivered_by || null,
        remarks: values.remarks || null,
        notes: values.notes || null,
        status: values.status as DeliveryChallanStatus,
        items: values.items,
      }

      if (initialData) {
        await updateDeliveryChallan(initialData.id, payload)
        toast.success("Delivery challan updated successfully!")
      } else {
        await addDeliveryChallan(payload, user?.id)
        toast.success("Delivery challan created successfully!")
      }

      router.push("/delivery-challans")
      router.refresh()
    } catch (error) {
      toast.error(parseStockError(error) || "An error occurred while saving the delivery challan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedCompany) return null

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <PageHeader
        eyebrow="Delivery Challans"
        title={isEditMode ? "Edit delivery challan" : "Create delivery challan"}
        description={
          isEditMode
            ? "Update delivery challan details and items."
            : `Create a new delivery challan for ${selectedCompany.name}`
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update delivery challan" : "Create delivery challan"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Challan Number *</Label>
                <Input
                  {...form.register("challan_number")}
                  readOnly={isEditMode}
                  className={isEditMode ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" {...form.register("date")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={customerId || undefined}
                onValueChange={(val: string | null) => {
                  if (val) form.setValue("customer_id", val, { shouldValidate: true })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer">
                    {(value: string | null) =>
                      customers.find((c) => c.id === value)?.name ?? "Select a customer"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customer_id && (
                <p className="text-xs text-destructive">{form.formState.errors.customer_id.message}</p>
              )}
            </div>

            {selectedCustomer && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{selectedCustomer.name}</p>
                <p className="mt-1 line-clamp-2">{selectedCustomer.address || "No address"}</p>
                <p className="mt-1">GST: {selectedCustomer.gst_number || "—"}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={(val: string | null) => {
                  if (val) form.setValue("status", val)
                }}
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Challan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Quality *</Label>
                <Select
                  value={stockId || undefined}
                  onValueChange={(val: string | null) => {
                    if (!val) return
                    const stock = stocks.find((s) => s.id === val)
                    form.setValue("stock_id", val, { shouldValidate: true })
                    form.setValue("quality", stock?.quality_name || "")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality">
                      {selectedStock?.quality_name || "Select quality"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {stocks.map((stock) => (
                      <SelectItem key={stock.id} value={stock.id}>
                        {stock.quality_name} ({stock.available_taka} avail.)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableForSale != null && (
                  <p className="text-xs text-muted-foreground">
                    Available: {availableForSale} Taka
                  </p>
                )}
                {availableForSale != null && totals.pieces > availableForSale && (
                  <p className="text-xs text-red-500">
                    Only {availableForSale} Taka Available.
                  </p>
                )}
                {form.formState.errors.stock_id && (
                  <p className="text-xs text-red-500">{form.formState.errors.stock_id.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Broker</Label>
                <Input {...form.register("broker")} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivered By</Label>
              <Input {...form.register("delivered_by")} placeholder="e.g. Rajesh Patel" />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea {...form.register("remarks")} placeholder="Optional remarks" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Items</CardTitle>
            <CardDescription>Add taka / meters / weight rows</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ taka_no: "", meters: 0, weight: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Sr No</TableHead>
                  <TableHead>Taka No.</TableHead>
                  <TableHead className="w-[140px]">MTS</TableHead>
                  <TableHead className="w-[140px]">Wt.</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="p-2">
                      <Input {...form.register(`items.${index}.taka_no`)} className="h-8" />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.meters`)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.weight`)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-[280px] space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span>Total Pieces:</span>
                <span className="font-medium">{totals.pieces}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total MTS:</span>
                <span className="font-medium">{totals.meters.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Weight:</span>
                <span className="font-medium">{totals.weight.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...form.register("notes")} placeholder="Any special instructions..." />
        </CardContent>
      </Card>
    </form>
  )
}
