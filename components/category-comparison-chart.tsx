"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface CategoryComparisonChartProps {
  type?: "expense" | "income" | "expenses"
  period?: string
  refreshKey?: number
}

interface ChartData {
  name: string
  current: number
  previous: number
}

export function CategoryComparisonChart({ type = "expense", period = "month", refreshKey }: CategoryComparisonChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch current period data
        const currentResponse = await fetch(`/api/reports/data?period=${period}`)
        if (!currentResponse.ok) {
          throw new Error('Failed to fetch current period data')
        }
        const currentData = await currentResponse.json()

        // Calculate previous period dates
        const now = new Date()
        let prevStartDate: Date, prevEndDate: Date

        switch (period) {
          case "quarter":
            const quarter = Math.floor(now.getMonth() / 3)
            prevStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
            prevEndDate = new Date(now.getFullYear(), quarter * 3, 0)
            break
          case "year":
            prevStartDate = new Date(now.getFullYear() - 1, 0, 1)
            prevEndDate = new Date(now.getFullYear() - 1, 11, 31)
            break
          default: // month
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
        }

        // Fetch previous period data
        const prevResponse = await fetch(
          `/api/reports/data?startDate=${prevStartDate.toISOString()}&endDate=${prevEndDate.toISOString()}`
        )
        
        let prevData = { categoryBreakdown: { income: [], expenses: [] } }
        if (prevResponse.ok) {
          prevData = await prevResponse.json()
        }

        // Determine which data to use based on type
        const dataType = type === "income" ? "income" : "expenses"
        const currentCategories = currentData.categoryBreakdown[dataType] || []
        const prevCategories = prevData.categoryBreakdown[dataType] || []

        // Create a map of previous period data for easy lookup
        const prevCategoryMap = prevCategories.reduce((acc: any, item: any) => {
          acc[item.category] = item.amount
          return acc
        }, {})

        // Combine current and previous data
        const chartData: ChartData[] = currentCategories.map((item: any) => ({
          name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          current: item.amount,
          previous: prevCategoryMap[item.category] || 0,
        }))

        // Add any categories that exist in previous but not current
        prevCategories.forEach((item: any) => {
          if (!currentCategories.find((curr: any) => curr.category === item.category)) {
            chartData.push({
              name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
              current: 0,
              previous: item.amount,
            })
          }
        })

        // Sort by current amount (highest first)
        chartData.sort((a, b) => b.current - a.current)

        setData(chartData)
      } catch (err) {
        console.error('Error fetching category comparison data:', err)
        setError('Failed to load category comparison data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type, period, refreshKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading category data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>{error}</p>
          <p className="text-sm">Please try again later</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>No category data available</p>
          <p className="text-sm">Add some {type === "income" ? "income" : "expenses"} to see the comparison</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
        <Legend />
        <Bar dataKey="current" name={`Current ${period}`} fill="#60a5fa" />
        <Bar dataKey="previous" name={`Previous ${period}`} fill="#a78bfa" />
      </BarChart>
    </ResponsiveContainer>
  )
}

const expenseData = [
  {
    name: "Housing",
    current: 1200,
    previous: 1200,
  },
  {
    name: "Food",
    current: 350,
    previous: 310,
  },
  {
    name: "Transport",
    current: 120,
    previous: 140,
  },
  {
    name: "Entertainment",
    current: 150,
    previous: 120,
  },
  {
    name: "Utilities",
    current: 180,
    previous: 170,
  },
]

const incomeData = [
  {
    name: "Salary",
    current: 3000,
    previous: 3000,
  },
  {
    name: "Freelance",
    current: 250,
    previous: 180,
  },
  {
    name: "Investments",
    current: 152,
    previous: 140,
  },
  {
    name: "Other",
    current: 50,
    previous: 30,
  },
]
