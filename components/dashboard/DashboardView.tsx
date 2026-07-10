"use client"

import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CalendarDays, IndianRupee, ArrowRight, Building2 } from "lucide-react"
import { getDashboardStats } from "@/services/dashboard.service"
import { useEffect, useState } from "react"
import { DashboardStats } from "@/types"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"
import { cn } from "@/lib/utils"
import { StaggerContainer, StaggerItem, Counter, FadeIn, GsapReveal } from "@/components/animations"

export default function DashboardView() {
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
      <div className="flex h-[80vh] items-center justify-center animate-in fade-in duration-500">
        <EmptyState
          icon={<Building2 />}
          title="Welcome to Textile Challan"
          description="Select a workspace from the sidebar to view your dashboard, or create a new company to get started."
          action={
            <Button onClick={() => router.push('/companies/new')}>
              Create Company
            </Button>
          }
        />
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Total Challans",
      value: stats?.totalChallans ?? 0,
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30"
    },
    {
      title: "Today's Challans",
      value: stats?.todayChallans ?? 0,
      icon: CalendarDays,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30"
    },
    {
      title: "Monthly Sales",
      value: stats?.monthlySales ?? 0,
      format: (val: number) => `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30"
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      <FadeIn direction="down" duration={0.6}>
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Overview and recent activity for <span className="font-medium text-foreground">{selectedCompany.name}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => router.push('/challans/new')} className="premium-shadow">
              <FileText className="mr-2 h-4 w-4" />
              Create Challan
            </Button>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-4" delayChildren={0.2}>
        {statCards.map((stat, i) => (
          <StaggerItem key={i}>
            <Card className="group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground tracking-tight">
                    {isLoading ? "..." : <Counter value={stat.value as number} format={stat.format} />}
                  </span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <GsapReveal direction="up" delay={0.4} triggerOffset="top 90%">
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 pb-4 px-6 pt-6">
            <CardTitle className="text-lg">Recent Challans</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/challans')} className="text-muted-foreground hover:text-foreground group">
              View all
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading recent activity...</div>
            ) : stats?.recentChallans.length ? (
              <div className="divide-y">
                {stats.recentChallans.map((challan) => (
                  <div
                    key={challan.id}
                    className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors cursor-pointer group/row"
                    onClick={() => router.push(`/challans/${challan.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover/row:scale-110 transition-transform duration-300">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover/row:text-primary transition-colors">{challan.challan_number}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {challan.customer?.name || challan.party?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₹{(challan.grand_total ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(challan.date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={<FileText />}
                  title="No recent challans"
                  description="Create your first challan to see it appear here."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </GsapReveal>
    </div>
  )
}
