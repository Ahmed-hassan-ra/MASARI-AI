"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useEffect, useState } from "react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#ff7300", "#82ca9d"]

interface ExpenseChartProps {
  refreshKey?: number
  selectedMonth?: number // 0-11 (JavaScript month format)
  selectedYear?: number
}

interface ChartData {
  name: string
  value: number
}

export function ExpenseChart({ refreshKey, selectedMonth, selectedYear }: ExpenseChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExpenseData() {
      setLoading(true)
      try {
        // Use provided month/year or default to current month
        const now = new Date()
        const year = selectedYear ?? now.getFullYear()
        const month = selectedMonth ?? now.getMonth()
        
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

        const res = await fetch(`/api/expenses?startDate=${startDate}&endDate=${endDate}`)
        
        if (res.ok) {
          const expenses = await res.json()
          
          // Group expenses by category
          const categoryTotals: Record<string, number> = {}
          expenses.forEach((expense: any) => {
            const categoryName = expense.category.charAt(0).toUpperCase() + expense.category.slice(1)
            categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount
          })

          // Convert to chart data format
          const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value
          }))

          setData(chartData)
        } else {
          setData([])
        }
      } catch (error) {
        console.error("Error fetching expense data:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchExpenseData()
  }, [refreshKey, selectedMonth, selectedYear])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (data.length === 0) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"]
    const displayMonth = selectedMonth !== undefined ? monthNames[selectedMonth] : "this month"
    const displayYear = selectedYear !== undefined ? ` ${selectedYear}` : ""
    
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">No expenses recorded for {displayMonth}{displayYear}</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
