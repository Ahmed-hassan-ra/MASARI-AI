import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { deepseekJSON } from "@/lib/deepseek"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "month"

    const now = new Date()
    let currentStart: Date, currentEnd: Date

    switch (period) {
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        currentStart = new Date(now.getFullYear(), quarter * 3, 1)
        currentEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        break
      case "year":
        currentStart = new Date(now.getFullYear(), 0, 1)
        currentEnd = new Date(now.getFullYear(), 11, 31)
        break
      default:
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    const historicalStart = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const [currentExpenses, currentIncome, historicalExpenses] = await Promise.all([
      prisma.expense.findMany({ where: { userId: session.user.id, date: { gte: currentStart, lte: currentEnd } } }),
      prisma.income.findMany({ where: { userId: session.user.id, date: { gte: currentStart, lte: currentEnd } } }),
      prisma.expense.findMany({ where: { userId: session.user.id, date: { gte: historicalStart, lte: currentEnd } } }),
    ])

    const currentIncomeTotal = currentIncome.reduce((s, i) => s + i.amount, 0)
    const currentExpenseTotal = currentExpenses.reduce((s, e) => s + e.amount, 0)

    // Group current expenses by category
    const byCategory = currentExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    // Group historical by category (monthly averages)
    const historicalMonthly: Record<string, number[]> = {}
    historicalExpenses.forEach(e => {
      const monthKey = `${new Date(e.date).getFullYear()}-${new Date(e.date).getMonth()}`
      if (!historicalMonthly[e.category]) historicalMonthly[e.category] = []
      // Simple accumulation per month
    })

    // Calculate 6-month averages per category
    const historicalByCategory = historicalExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
    const monthsOfHistory = 6
    const historicalAvg = Object.fromEntries(
      Object.entries(historicalByCategory).map(([cat, total]) => [cat, total / monthsOfHistory])
    )

    const categoryDetails = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amt]) => {
        const avg = historicalAvg[cat] ? `6-month avg: $${historicalAvg[cat].toFixed(2)}` : "no history"
        return `  - ${cat}: $${amt.toFixed(2)} (${avg})`
      })
      .join("\n")

    const prompt = `You are a personal finance optimizer. Analyze this user's real spending data and return ONLY valid JSON with budget recommendations. No extra text.

FINANCIAL DATA (${period}):
- Total Income: $${currentIncomeTotal.toFixed(2)}
- Total Expenses: $${currentExpenseTotal.toFixed(2)}
- Net Savings: $${(currentIncomeTotal - currentExpenseTotal).toFixed(2)}

Spending by category (with 6-month historical averages):
${categoryDetails || "  No expenses yet"}

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "category": "exact category name from data above",
      "currentSpending": number,
      "recommendedBudget": number,
      "potentialSavings": number,
      "confidence": "high" | "medium" | "low",
      "reasoning": "Specific reason using real numbers (1 sentence)"
    }
  ]
}

Rules:
- Use EXACT category names and amounts from the data above
- recommendedBudget must be a realistic target (not zero)
- potentialSavings = currentSpending - recommendedBudget (can be negative if recommending increase)
- confidence: "high" if spending is clearly excessive, "medium" if moderate, "low" if minimal data
- reasoning must reference the actual numbers
- Include 3-6 categories with the most impact
- Return only the JSON object, no other text`

    const content = await deepseekJSON(
      [{ role: "user", content: prompt }],
      { temperature: 0.2, max_tokens: 1500 }
    )

    const parsed = JSON.parse(content)
    const recommendations = parsed.recommendations || []

    const totalPotentialSavings = recommendations.reduce(
      (sum: number, rec: any) => sum + Math.max(0, rec.potentialSavings || 0),
      0
    )

    return NextResponse.json({ recommendations, totalPotentialSavings, period })
  } catch (error) {
    console.error("[BUDGET_OPTIMIZER]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
