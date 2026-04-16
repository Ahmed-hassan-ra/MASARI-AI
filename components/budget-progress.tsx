"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

interface BudgetCategory {
  name: string
  amount: number
  spent: number
}

interface Budget {
  id: string
  name: string
  categories: BudgetCategory[]
}

export function BudgetProgress() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    fetch("/api/budgets")
      .then((r) => r.json())
      .then((data) => {
        setBudgets(Array.isArray(data) ? data : [])
      })
      .catch(() => setBudgets([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="flex justify-between">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted" />
            </div>
            <div className="h-2 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  // Flatten all categories across all budgets
  const allCategories = budgets.flatMap((b) =>
    b.categories.map((c) => ({
      budgetName: b.name,
      category: c.name,
      spent: c.spent ?? 0,
      total: c.amount,
      percentage: c.amount > 0 ? Math.min(Math.round((c.spent / c.amount) * 100), 100) : 0,
    }))
  )

  if (allCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
        <p className="text-sm text-muted-foreground">No budgets set up yet.</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/budgets">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create your first budget
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {allCategories.map((item, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">{item.category}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(item.spent)} of {formatCurrency(item.total)}
              </p>
            </div>
            <div className="text-sm font-medium">{item.percentage}%</div>
          </div>
          <Progress value={item.percentage} className="h-2" />
        </div>
      ))}
    </div>
  )
}
