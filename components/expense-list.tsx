"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"

interface ExpenseListProps {
  filter?: "today" | "week" | "month"
  refreshKey?: number
  selectedMonth?: number
  selectedYear?: number
}

function getDateRangeForFilter(filter?: "today" | "week" | "month") {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (filter) {
    case "today":
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    case "week":
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      }
    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0]
      }
    default:
      return null
  }
}

export function ExpenseList({ filter, refreshKey }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true)
      try {
        let url = "/api/expenses"
        const dateRange = getDateRangeForFilter(filter)
        
        if (dateRange) {
          const params = new URLSearchParams({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          url += `?${params.toString()}`
        }

        const res = await fetch(url)
        const data = await res.json()
        setExpenses(data || [])
      } catch (err) {
        console.error("Error fetching expenses:", err)
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }
    fetchExpenses()
  }, [refreshKey, filter])

  if (loading) return <div className="flex items-center justify-center p-4">Loading...</div>
  if (!expenses.length) {
    const filterText = filter ? ` for ${filter}` : ""
    return <div className="flex items-center justify-center p-4 text-muted-foreground">No expense records found{filterText}.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell>
              <Badge variant="outline">{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</Badge>
            </TableCell>
            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
