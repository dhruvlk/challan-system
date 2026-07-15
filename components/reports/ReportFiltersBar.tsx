"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PERIOD_PRESET_LABELS, type ReportPeriodPreset } from "@/lib/reports/date-ranges"
import type { ReportFilters } from "@/types/reports"

const PERIODS: ReportPeriodPreset[] = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
  "last_year",
  "custom",
  "all",
]

type Props = {
  filters: ReportFilters
  onChange: (next: ReportFilters) => void
  customers: Array<{ id: string; name: string }>
  qualities: string[]
  brokers: string[]
}

export function ReportFiltersBar({
  filters,
  onChange,
  customers,
  qualities,
  brokers,
}: Props) {
  const set = (patch: Partial<ReportFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-1.5">
          <Label>Period</Label>
          <Select
            value={filters.period}
            onValueChange={(val) => {
              if (val) set({ period: val as ReportPeriodPreset })
            }}
          >
            <SelectTrigger>
              <SelectValue>{PERIOD_PRESET_LABELS[filters.period]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((period) => (
                <SelectItem key={period} value={period}>
                  {PERIOD_PRESET_LABELS[period]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filters.period === "custom" && (
          <>
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => set({ dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => set({ dateTo: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label>Customer</Label>
          <Select
            value={filters.customerId || "__all"}
            onValueChange={(val) => set({ customerId: !val || val === "__all" ? undefined : val })}
          >
            <SelectTrigger>
              <SelectValue>
                {filters.customerId
                  ? customers.find((c) => c.id === filters.customerId)?.name || "Customer"
                  : "All customers"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Quality</Label>
          <Select
            value={filters.quality || "__all"}
            onValueChange={(val) => set({ quality: !val || val === "__all" ? undefined : val })}
          >
            <SelectTrigger>
              <SelectValue>{filters.quality || "All qualities"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All qualities</SelectItem>
              {qualities.map((quality) => (
                <SelectItem key={quality} value={quality}>
                  {quality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Broker</Label>
          <Select
            value={filters.broker || "__all"}
            onValueChange={(val) => set({ broker: !val || val === "__all" ? undefined : val })}
          >
            <SelectTrigger>
              <SelectValue>{filters.broker || "All brokers"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All brokers</SelectItem>
              {brokers.map((broker) => (
                <SelectItem key={broker} value={broker}>
                  {broker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Payment Status</Label>
          <Select
            value={filters.paymentStatus || "__all"}
            onValueChange={(val) =>
              set({ paymentStatus: !val || val === "__all" ? undefined : val })
            }
          >
            <SelectTrigger>
              <SelectValue>{filters.paymentStatus || "All statuses"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2 xl:col-span-2">
          <Label>Search</Label>
          <Input
            placeholder="Search customers or qualities..."
            value={filters.search || ""}
            onChange={(e) => set({ search: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
