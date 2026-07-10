import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TableSkeleton } from "@/components/ui/skeleton"

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
  hideSearch = false,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {onSearchChange && !hideSearch && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            value={searchValue || ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-soft">
        {isLoading ? (
          <TableSkeleton rows={6} cols={columns.length} />
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                {columns.map((col, index) => (
                  <TableHead key={index} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={col.className}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                            ? String(row[col.accessorKey] || "")
                            : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
