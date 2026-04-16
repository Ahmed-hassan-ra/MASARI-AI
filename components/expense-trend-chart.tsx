"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface ExpenseTrendChartProps {
  type?: "expense" | "income" | "savings"
  period?: string
  refreshKey?: number
}

interface ChartData {
  name: string
  amount?: number
  rate?: number
}

export function ExpenseTrendChart({ type = "expense", period = "month", refreshKey }: ExpenseTrendChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/reports/data?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch trend data')
        }
        
        const reportData = await response.json()
        
        if (type === "savings") {
          // Calculate savings rate for each month
          const savingsData = reportData.monthlyData.map((month: any) => ({
            name: month.name,
            rate: month.income > 0 ? Math.round(((month.income - month.expenses) / month.income) * 100) : 0
          }))
          setData(savingsData)
        } else if (type === "income") {
          const incomeData = reportData.monthlyData.map((month: any) => ({
            name: month.name,
            amount: month.income
          }))
          setData(incomeData)
        } else {
          // expense
          const expenseData = reportData.monthlyData.map((month: any) => ({
            name: month.name,
            amount: month.expenses
          }))
          setData(expenseData)
        }
      } catch (err) {
        console.error('Error fetching trend data:', err)
        setError('Failed to load trend data')
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
        <span>Loading trend data...</span>
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
          <p>No trend data available</p>
          <p className="text-sm">Add some transactions to see the trend</p>
        </div>
      </div>
    )
  }

  const color = type === "expense" ? "#f87171" : type === "income" ? "#4ade80" : "#60a5fa"
  const dataKey = type === "savings" ? "rate" : "amount"

  const tooltipFormatter = type === "savings"
      ? (value: number) => [`${value}%`, "Savings Rate"]
    : (value: number) => [`$${value.toFixed(2)}`, type === "expense" ? "Expenses" : "Income"]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={type === "savings" ? (value: number) => `${value}%` : (value: number) => `$${value}`} />
        <Tooltip formatter={tooltipFormatter} />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          fill={color} 
          fillOpacity={0.3} 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}


