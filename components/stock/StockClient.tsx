"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Boxes, PackageMinus, PackageOpen, Pencil, Trash2, TriangleAlert, Warehouse } from "lucide-react"
import { useCompany } from "@/components/company-provider"
import { StockFormDialog } from "@/components/stock/StockFormDialog"
import { StockStatusBadge } from "@/components/stock/StockStatusBadge"
import { StatCard } from "@/components/common/StatCard"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { DataTable } from "@/components/tables/DataTable"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion"
import {
  deleteStock,
  getStockSummary,
  getStocks,
  parseStockError,
} from "@/services/stocks.service"
import type { Stock, StockStatus, StockSummary } from "@/types"

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "__all", label: "All statuses" },
  { value: "Available", label: "Available" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out Of Stock", label: "Out Of Stock" },
]

export default function StockClient() {
  const { selectedCompany } = useCompany()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [summary, setSummary] = useState<StockSummary | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("__all")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null)

  const load = async () => {
    if (!selectedCompany) return
    setIsLoading(true)
    try {
      const [rows, stats] = await Promise.all([
        getStocks(selectedCompany.id, {
          search,
          status: status === "__all" ? "" : (status as StockStatus),
        }),
        getStockSummary(selectedCompany.id),
      ])
      setStocks(rows)
      setSummary(stats)
    } catch {
      toast.error("Failed to load stock")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [selectedCompany, search, status])

  const confirmDelete = async () => {
    if (!stockToDelete) return
    try {
      await deleteStock(stockToDelete.id)
      toast.success("Stock deleted.")
      await load()
    } catch (error) {
      toast.error(parseStockError(error))
    }
    setDeleteOpen(false)
    setStockToDelete(null)
  }

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={Warehouse}
        title="Select a company"
        description="Choose a company from the header to manage quality-wise stock."
      />
    )
  }

  const columns = [
    {
      header: "Quality Name",
      accessorKey: "quality_name" as keyof Stock,
      className: "font-medium",
    },
    {
      header: "Total Taka",
      cell: (row: Stock) => (
        <span className="tabular-nums">{row.total_taka}</span>
      ),
    },
    {
      header: "Sold Taka",
      cell: (row: Stock) => (
        <span className="tabular-nums text-muted-foreground">{row.sold_taka}</span>
      ),
    },
    {
      header: "Available Taka",
      cell: (row: Stock) => (
        <span className="tabular-nums font-medium">{row.available_taka}</span>
      ),
    },
    {
      header: "Status",
      cell: (row: Stock) => <StockStatusBadge stock={row} />,
    },
    {
      header: "HSN Code",
      cell: (row: Stock) => row.hsn_code || "—",
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row: Stock) => (
        <div className="flex justify-end gap-2">
          <StockFormDialog
            initialData={row}
            onSaved={load}
            trigger={
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => {
              setStockToDelete(row)
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Stock"
        description={`Quality-wise textile stock for ${selectedCompany.name}`}
        action={<StockFormDialog onSaved={load} />}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            title="Total Qualities"
            value={summary?.totalQualities ?? 0}
            icon={Boxes}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Total Taka"
            value={summary?.totalTaka ?? 0}
            icon={Boxes}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Sold Taka"
            value={summary?.totalSoldTaka ?? 0}
            icon={PackageMinus}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Available Taka"
            value={summary?.totalAvailableTaka ?? 0}
            icon={PackageOpen}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Low / Out"
            value={`${summary?.lowStockCount ?? 0} / ${summary?.outOfStockCount ?? 0}`}
            icon={TriangleAlert}
            iconClassName="bg-amber-50 ring-amber-200"
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="show" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Available = Total − Sold. Sold updates automatically from Delivery Challans.
          </p>
          <Select value={status} onValueChange={(val) => setStatus(val || "__all")}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue>
                {STATUS_FILTERS.find((f) => f.value === status)?.label ?? "All statuses"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {stocks.length === 0 && !isLoading ? (
          <EmptyState
            icon={Warehouse}
            title="No stock qualities yet"
            description="Add stock when new cloth is manufactured. Delivery Challans will deduct Taka automatically."
            action={<StockFormDialog onSaved={load} />}
          />
        ) : (
          <DataTable
            data={stocks}
            columns={columns}
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
            searchPlaceholder="Search by quality name..."
          />
        )}
      </motion.div>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Stock"
        description={`Delete ${stockToDelete?.quality_name}? This removes the quality and its history.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
