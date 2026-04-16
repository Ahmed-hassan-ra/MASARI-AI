import { Progress } from "@/components/ui/progress"

export function BudgetProgress() {
  return (
    <div className="space-y-8">
      {budgets.map((budget) => (
        <div key={budget.category} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{budget.category}</p>
              <p className="text-sm text-muted-foreground">
                ${budget.spent} of ${budget.total}
              </p>
            </div>
            <div className="text-sm font-medium">{budget.percentage}%</div>
          </div>
          <Progress
            value={budget.percentage}
            className="h-2"
          />
        </div>
      ))}
    </div>
  )
}

const budgets = [
  {
    category: "Housing",
    spent: 1200,
    total: 1200,
    percentage: 100,
  },
  {
    category: "Food & Groceries",
    spent: 350,
    total: 500,
    percentage: 70,
  },
  {
    category: "Transportation",
    spent: 120,
    total: 300,
    percentage: 40,
  },
  {
    category: "Entertainment",
    spent: 150,
    total: 200,
    percentage: 75,
  },
  {
    category: "Utilities",
    spent: 180,
    total: 250,
    percentage: 72,
  },
]
