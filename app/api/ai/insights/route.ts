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
    let currentStart: Date, currentEnd: Date, prevStart: Date, prevEnd: Date

    switch (period) {
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        currentStart = new Date(now.getFullYear(), quarter * 3, 1)
        currentEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        prevStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        prevEnd = new Date(now.getFullYear(), quarter * 3, 0)
        break
      case "year":
        currentStart = new Date(now.getFullYear(), 0, 1)
        currentEnd = new Date(now.getFullYear(), 11, 31)
        prevStart = new Date(now.getFullYear() - 1, 0, 1)
        prevEnd = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    const [currentExpenses, prevExpenses, currentIncome, prevIncome, budgets, goals] =
      await Promise.all([
        prisma.expense.findMany({ where: { userId: session.user.id, date: { gte: currentStart, lte: currentEnd } } }),
        prisma.expense.findMany({ where: { userId: session.user.id, date: { gte: prevStart, lte: prevEnd } } }),
        prisma.income.findMany({ where: { userId: session.user.id, date: { gte: currentStart, lte: currentEnd } } }),
        prisma.income.findMany({ where: { userId: session.user.id, date: { gte: prevStart, lte: prevEnd } } }),
        prisma.budget.findMany({ where: { userId: session.user.id }, include: { categories: true }, take: 5 }),
        prisma.goal.findMany({ where: { userId: session.user.id }, take: 5 }),
      ])

    // Crunch numbers
    const currentExpenseTotal = currentExpenses.reduce((s, e) => s + e.amount, 0)
    const prevExpenseTotal = prevExpenses.reduce((s, e) => s + e.amount, 0)
    const currentIncomeTotal = currentIncome.reduce((s, i) => s + i.amount, 0)
    const prevIncomeTotal = prevIncome.reduce((s, i) => s + i.amount, 0)
    const savingsRate = currentIncomeTotal > 0
      ? (((currentIncomeTotal - currentExpenseTotal) / currentIncomeTotal) * 100).toFixed(1)
      : "0"

    const byCategory = currentExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    const categoryBreakdown = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amt]) => `  - ${cat}: $${amt.toFixed(2)}`)
      .join("\n")

    const goalsSummary = goals.map(g =>
      `  - ${g.name}: $${g.currentAmount.toFixed(2)} / $${g.targetAmount.toFixed(2)} (${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}%)`
    ).join("\n")

    const budgetSummary = budgets.map(b => {
      const spent = currentExpenses
        .filter(e => b.categories.some(c => c.name.toLowerCase() === e.category.toLowerCase()))
        .reduce((s, e) => s + e.amount, 0)
      return `  - ${b.name}: spent $${spent.toFixed(2)} of $${b.amount.toFixed(2)}`
    }).join("\n")

    const prompt = `You are a personal finance analyst. Analyze this user's real financial data and return ONLY a valid JSON array of insights. No extra text.

FINANCIAL DATA (${period}):
- Income: $${currentIncomeTotal.toFixed(2)} (prev: $${prevIncomeTotal.toFixed(2)})
- Expenses: $${currentExpenseTotal.toFixed(2)} (prev: $${prevExpenseTotal.toFixed(2)})
- Savings Rate: ${savingsRate}%
- Net: $${(currentIncomeTotal - currentExpenseTotal).toFixed(2)}

Spending by category:
${categoryBreakdown || "  No expenses yet"}

Budgets:
${budgetSummary || "  No budgets set"}

Savings Goals:
${goalsSummary || "  No goals set"}

Return a JSON array of 4-6 insights. Each insight must follow this exact structure:
{
  "id": "unique-string",
  "type": "warning" | "suggestion" | "achievement" | "prediction",
  "title": "Short title (max 8 words)",
  "description": "Specific insight using the real numbers above (1-2 sentences)",
  "impact": "high" | "medium" | "low",
  "actionable": true | false,
  "action": "Specific action step (only if actionable is true)",
  "savings": number (optional - estimated monthly savings if action is taken),
  "category": "category name (optional)"
}

Rules:
- Use the EXACT numbers from the data above — do not invent numbers
- Be specific: say "$X on Y" not "a lot on Y"
- Mix types: include warnings, suggestions, achievements, and predictions
- Return only the JSON array, no other text`

    const content = await deepseekJSON(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, max_tokens: 2000 }
    )

    const parsed = JSON.parse(content)
    // Handle both {insights: [...]} and direct array responses
    const insights = Array.isArray(parsed) ? parsed : (parsed.insights || [])

    return NextResponse.json({ insights, period })
  } catch (error) {
    console.error("[AI_INSIGHTS]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
