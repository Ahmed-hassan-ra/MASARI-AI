"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ChartData {
  name: string
  income: number
  expenses: number
}

const fallbackData: ChartData[] = [
  { name: "Jan", income: 0, expenses: 0 },
  { name: "Feb", income: 0, expenses: 0 },
  { name: "Mar", income: 0, expenses: 0 },
  { name: "Apr", income: 0, expenses: 0 },
  { name: "May", income: 0, expenses: 0 },
  { name: "Jun", income: 0, expenses: 0 },
]

export function Overview() {
  const [data, setData] = useState<ChartData[]>(fallbackData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/reports/chart-data")
        if (response.ok) {
          const chartData = await response.json()
          setData(chartData)
        } else {
          // If API fails, use current month data from dashboard
          const dashboardResponse = await fetch("/api/dashboard/summary")
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json()
            const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' })
            const updatedData = fallbackData.map(item => 
              item.name === currentMonth 
                ? { ...item, income: dashboardData.income, expenses: dashboardData.expenses }
                : item
            )
            setData(updatedData)
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
        // Keep fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip formatter={(value) => [`$${value}`, ""]} labelFormatter={(label) => `Month: ${label}`} />
        <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
