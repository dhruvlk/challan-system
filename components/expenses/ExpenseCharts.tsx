"use client"

import { useMemo } from "react"
import { Expense } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ExpenseChartsProps {
  expenses: Expense[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#8b5cf6', '#3b82f6'];

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {}
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount
    })
    return Object.keys(data).map(key => ({ name: key, value: data[key] }))
  }, [expenses])

  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {}
    expenses.forEach(e => {
      const month = new Date(e.expense_date).toLocaleString('default', { month: 'short', year: 'numeric' })
      data[month] = (data[month] || 0) + e.amount
    })
    return Object.keys(data).map(key => ({ name: key, total: data[key] }))
  }, [expenses])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `₹${Number(value).toFixed(2)}`} />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
