"use client"

import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { PieChart as PieChartIcon } from "lucide-react"
import { MotionStagger, MotionStaggerItem } from "@/components/common/motion"

const COLORS = ["#4d6ef5", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid oklch(0.91 0.01 264)",
  boxShadow: "var(--shadow-sm)",
  fontSize: "12px",
}

export default function ReportsClient() {
  const { selectedCompany } = useCompany()

  if (!selectedCompany) {
    return (
      <EmptyState
        icon={PieChartIcon}
        title="Select a company"
        description="Choose a company from the header to view reports and analytics."
      />
    )
  }

  const monthlyData = [
    { name: "Jan", revenue: 4000, deliveries: 24 },
    { name: "Feb", revenue: 3000, deliveries: 18 },
    { name: "Mar", revenue: 5000, deliveries: 35 },
    { name: "Apr", revenue: 4500, deliveries: 28 },
    { name: "May", revenue: 6000, deliveries: 42 },
    { name: "Jun", revenue: 5500, deliveries: 38 },
  ]

  const partyData = [
    { name: "Rajesh Textiles", value: 400 },
    { name: "Amit Fabrics", value: 300 },
    { name: "Suresh Mills", value: 300 },
    { name: "Ramesh Synthetics", value: 200 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="View insights and performance metrics for your business."
      />

      <MotionStagger className="grid gap-6 lg:grid-cols-2">
        <MotionStaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>Monthly revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 12, right: 12, bottom: 8, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.93 0.01 264)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4d6ef5"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#4d6ef5" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </MotionStaggerItem>

        <MotionStaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>Monthly deliveries</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 12, right: 12, bottom: 8, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.93 0.01 264)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="deliveries" fill="#4d6ef5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </MotionStaggerItem>

        <MotionStaggerItem className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Top parties by volume</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={110}
                    dataKey="value"
                  >
                    {partyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </MotionStaggerItem>
      </MotionStagger>
    </div>
  )
}
