"use client"

import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CalendarDays, IndianRupee } from "lucide-react"
import { getDashboardStats } from "@/services/dashboard.service"
import { useEffect, useState } from "react"
import { DashboardStats } from "@/types"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DashboardClient() {
  const router = useRouter()
  const { selectedCompany } = useCompany()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!selectedCompany) {
        setStats(null)
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const data = await getDashboardStats(selectedCompany.id)
        setStats(data)
      } catch {
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedCompany])

  if (!selectedCompany) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Welcome!</h2>
          <p className="text-muted-foreground max-w-[500px]">
            Select a company from the header or create one to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of {selectedCompany.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalCustomers ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Challans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalChallans ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Challans</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.todayChallans ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `₹${(stats?.monthlySales ?? 0).toLocaleString("en-IN")}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Challans</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/challans')}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : stats?.recentChallans.length ? (
            <div className="space-y-3">
              {stats.recentChallans.map((challan) => (
                <div key={challan.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{challan.challan_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {challan.customer?.name || challan.party?.name} · {format(new Date(challan.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(challan.grand_total ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{challan.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No challans yet. Create your first challan to see activity here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
