"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface CashFlowData {
  name: string
  income: number
  expenses: number
  savings: number
}

interface CashFlowChartProps {
  period?: string
  refreshKey?: number
}

export function CashFlowChart({ period = "month", refreshKey }: CashFlowChartProps) {
  const [data, setData] = useState<CashFlowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/reports/data?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cash flow data')
        }
        
        const reportData = await response.json()
        setData(reportData.monthlyData || [])
      } catch (err) {
        console.error('Error fetching cash flow data:', err)
        setError('Failed to load cash flow data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period, refreshKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading cash flow data...</span>
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
          <p>No cash flow data available</p>
          <p className="text-sm">Add some income and expenses to see the chart</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value: number) => `$${value}`} />
        <Tooltip 
          formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#4ade80" 
          activeDot={{ r: 8 }} 
          name="Income"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#f87171" 
          name="Expenses"
        />
        <Line 
          type="monotone" 
          dataKey="savings" 
          stroke="#60a5fa" 
          name="Savings"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
