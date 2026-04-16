"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useEffect, useState } from "react"

interface IncomeData {
  name: string
  value: number
  percentage: number
}

interface IncomeChartProps {
  refreshKey?: number
  selectedMonth?: number // 0-11 (JavaScript month format)
  selectedYear?: number
}

const COLORS = ["#4ade80", "#60a5fa", "#f97316", "#a78bfa", "#ef4444"]

export function IncomeChart({ refreshKey, selectedMonth, selectedYear }: IncomeChartProps) {
  const [data, setData] = useState<IncomeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIncomeData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Use provided month/year or default to current month
        const now = new Date()
        const year = selectedYear ?? now.getFullYear()
        const month = selectedMonth ?? now.getMonth()
        
        const startOfMonth = new Date(year, month, 1)
        const endOfMonth = new Date(year, month + 1, 0)
        
        const response = await fetch(
          `/api/income?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch income data')
        }
        
        const incomes = await response.json()
        
        // Group by category and calculate totals
        const categoryTotals: { [key: string]: number } = {}
        let totalIncome = 0
        
        incomes.forEach((income: any) => {
          const category = income.category || 'Other'
          categoryTotals[category] = (categoryTotals[category] || 0) + income.amount
          totalIncome += income.amount
        })
        
        // Convert to chart data format with percentages
        const chartData: IncomeData[] = Object.entries(categoryTotals).map(([category, amount]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
        }))
        
        // Sort by value (highest first)
        chartData.sort((a, b) => b.value - a.value)
        
        setData(chartData)
      } catch (err) {
        console.error('Error fetching income data:', err)
        setError('Failed to load income data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchIncomeData()
  }, [refreshKey, selectedMonth, selectedYear])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{error}</div>
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
        <div className="text-center text-muted-foreground">
          <p>No income data for {displayMonth}{displayYear}</p>
          <p className="text-sm">Add some income to see the breakdown</p>
        </div>
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
          label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend 
          formatter={(value, entry: any) => (
            <span style={{ color: entry.color }}>
              {value}: ${entry.payload.value.toFixed(2)} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
