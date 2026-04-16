"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

interface ChartData {
  name: string
  income: number
  expenses: number
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const { formatCompact } = useCurrency()

  useEffect(() => {
    fetch("/api/reports/chart-data")
      .then(r => r.ok ? r.json() : null)
      .then(chartData => {
        if (chartData && Array.isArray(chartData)) {
          const hasAny = chartData.some(d => d.income > 0 || d.expenses > 0)
          setData(chartData)
          setHasData(hasAny)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] gap-3 text-center">
        <p className="text-sm text-muted-foreground">Your income and expense chart will appear here once you add transactions.</p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/income"><PlusCircle className="mr-2 h-4 w-4" />Add Income</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/expenses"><PlusCircle className="mr-2 h-4 w-4" />Add Expense</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => formatCompact(v as number)} />
        <Tooltip formatter={(value) => [formatCompact(value as number), ""]} labelFormatter={label => `Month: ${label}`} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#2D82B5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
