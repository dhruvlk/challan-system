import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/common/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { FadeIn } from "@/components/animations"

interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
  emptyMessage?: string
  isLoading?: boolean
  hideSearch?: boolean
}

export function DataTable<T>({ 
  data, 
  columns, 
  searchPlaceholder = "Search...", 
  searchValue, 
  onSearchChange,
  emptyMessage = "No results found.",
  isLoading = false,
  hideSearch = false
}: DataTableProps<T>) {
  return (
    <FadeIn direction="up" duration={0.6}>
      <div className="space-y-4">
        {onSearchChange && !hideSearch && (
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9 h-10 premium-shadow rounded-xl border-border/50 transition-all focus-visible:ring-primary/50"
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, index) => (
                  <TableHead key={index} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={col.className}>
                        <Skeleton className="h-4 w-[80%] rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <div className="py-12">
                      <EmptyState 
                        icon={<FileX />}
                        title="No records found"
                        description={emptyMessage}
                        className="border-none min-h-[250px] bg-transparent"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={col.className}>
                        {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] || "") : "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </FadeIn>
  )
}
