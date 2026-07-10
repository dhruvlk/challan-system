"use client"

import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"
import { getChallans } from "@/services/challans.service"
import { getParties } from "@/services/parties.service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { Challan, Party } from "@/types"

export default function DashboardClient() {
  const { selectedCompany } = useCompany()
  const [companyChallans, setCompanyChallans] = useState<Challan[]>([])
  const [companyParties, setCompanyParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    if (!selectedCompany) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    
    try {
      const allChallans = await getChallans()
      const allParties = await getParties()
      
      setCompanyChallans(allChallans.filter(c => c.company_id === selectedCompany.id))
      setCompanyParties(allParties.filter(p => p.company_id === selectedCompany.id))
    } catch (error) {
      console.error("Failed to load dashboard data", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCompany])

  if (!selectedCompany) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Welcome!</h2>
          <p className="text-muted-foreground max-w-[500px]">
            To get started, please select a company from the top right menu, or create a new one.
          </p>
        </div>
      </div>
    )
  }

  // Calculate stats based on local storage data

  const totalChallans = companyChallans.length
  const pendingChallans = companyChallans.filter(c => c.status === 'Pending').length
  const deliveredChallans = companyChallans.filter(c => c.status === 'Delivered').length
  const totalParties = companyParties.length

  // Generate chart data (mocking daily trend)
  const chartData = [
    { name: 'Mon', challans: Math.floor(Math.random() * 20) + 5 },
    { name: 'Tue', challans: Math.floor(Math.random() * 20) + 5 },
    { name: 'Wed', challans: Math.floor(Math.random() * 20) + 5 },
    { name: 'Thu', challans: Math.floor(Math.random() * 20) + 5 },
    { name: 'Fri', challans: Math.floor(Math.random() * 20) + 5 },
    { name: 'Sat', challans: Math.floor(Math.random() * 20) + 5 },
    { name: 'Sun', challans: Math.floor(Math.random() * 20) + 5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of {selectedCompany.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Challans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChallans}</div>
            <p className="text-xs text-muted-foreground">Across all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingChallans}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredChallans}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParties}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Challan Activity (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="challans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Challans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {companyChallans.slice(0, 5).map(challan => (
                <div key={challan.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{challan.challan_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {challan.party?.name}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      challan.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      challan.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {challan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
