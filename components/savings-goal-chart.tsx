"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Emergency Fund",
    current: 6500,
    target: 10000,
  },
  {
    name: "Vacation",
    current: 1200,
    target: 3000,
  },
  {
    name: "Down Payment",
    current: 15000,
    target: 50000,
  },
  {
    name: "New Car",
    current: 4000,
    target: 20000,
  },
]

interface SavingsGoalChartProps {
  period?: string
  refreshKey?: number
}

export function SavingsGoalChart({ period: _period, refreshKey: _refreshKey }: SavingsGoalChartProps = {}) {
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
        <YAxis />
        <Tooltip formatter={(value) => `$${value}`} />
        <Legend />
        <Bar dataKey="current" name="Current Amount" fill="#60a5fa" />
        <Bar dataKey="target" name="Target Amount" fill="#a78bfa" />
      </BarChart>
    </ResponsiveContainer>
  )
}
