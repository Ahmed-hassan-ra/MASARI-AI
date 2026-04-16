import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { groqStream, type GroqMessage } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await req.json()

    // ── Fetch the user's real financial data ─────────────────────────────────
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0)
    const sixMonthsAgo   = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const [
      thisMonthExpenses, thisMonthIncome,
      lastMonthExpenses, lastMonthIncome,
      budgets, goals, recentExpenses,
    ] = await Promise.all([
      prisma.expense.findMany({ where: { userId: session.user.id, date: { gte: thisMonthStart, lte: thisMonthEnd } } }),
      prisma.income.findMany({  where: { userId: session.user.id, date: { gte: thisMonthStart, lte: thisMonthEnd } } }),
      prisma.expense.findMany({ where: { userId: session.user.id, date: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.income.findMany({  where: { userId: session.user.id, date: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.budget.findMany({
        where: { userId: session.user.id },
        include: { categories: true },
        orderBy: { startDate: "desc" },
        take: 3,
      }),
      prisma.goal.findMany({ where: { userId: session.user.id }, orderBy: { targetDate: "asc" }, take: 5 }),
      prisma.expense.findMany({
        where: { userId: session.user.id, date: { gte: sixMonthsAgo } },
        orderBy: { date: "desc" },
        take: 10,
        select: { description: true, amount: true, category: true, date: true },
      }),
    ])

    // ── Crunch the numbers ────────────────────────────────────────────────────
    const totalIncome   = thisMonthIncome.reduce((s, i) => s + i.amount, 0)
    const totalExpenses = thisMonthExpenses.reduce((s, e) => s + e.amount, 0)
    const netSavings    = totalIncome - totalExpenses
    const savingsRate   = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : "0"
    const prevIncome    = lastMonthIncome.reduce((s, i) => s + i.amount, 0)
    const prevExpenses  = lastMonthExpenses.reduce((s, e) => s + e.amount, 0)

    const pctChange = (cur: number, prev: number) => {
      if (prev === 0) return "N/A"
      const d = ((cur - prev) / prev) * 100
      return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`
    }

    const byCategory = thisMonthExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a).slice(0, 6)
      .map(([cat, amt]) => `  • ${cat}: $${amt.toFixed(2)}`).join("\n")

    const budgetSummary = budgets.length > 0
      ? budgets.map(b => {
          const spent = thisMonthExpenses
            .filter(e => b.categories.some(c => c.name.toLowerCase() === e.category.toLowerCase()))
            .reduce((s, e) => s + e.amount, 0)
          const pct = b.amount > 0 ? ((spent / b.amount) * 100).toFixed(0) : "0"
          return `  • ${b.name}: $${spent.toFixed(2)} / $${b.amount.toFixed(2)} (${pct}% used)`
        }).join("\n")
      : "  No budgets set up yet"

    const goalSummary = goals.length > 0
      ? goals.map(g => {
          const pct = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(0) : "0"
          return `  • ${g.name}: $${g.currentAmount.toFixed(2)} / $${g.targetAmount.toFixed(2)} (${pct}%)`
        }).join("\n")
      : "  No savings goals set up yet"

    const recentTxSummary = recentExpenses.length > 0
      ? recentExpenses.slice(0, 5).map(e =>
          `  • ${e.description} — $${e.amount.toFixed(2)} (${e.category}) on ${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        ).join("\n")
      : "  No recent transactions"

    const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    // ── Build personalised system prompt ─────────────────────────────────────
    const systemPrompt = `You are the personal AI financial assistant inside MA$ARI-AI Finance.
You have access to the user's live financial data and must give specific, personalised advice
based on their actual numbers — not generic tips.

## This Month (${monthName})
- Income:       $${totalIncome.toFixed(2)}  (vs $${prevIncome.toFixed(2)} last month, ${pctChange(totalIncome, prevIncome)})
- Expenses:     $${totalExpenses.toFixed(2)}  (vs $${prevExpenses.toFixed(2)} last month, ${pctChange(totalExpenses, prevExpenses)})
- Net Saved:    $${netSavings.toFixed(2)}
- Savings Rate: ${savingsRate}%

## Spending Breakdown
${topCategories || "  No expenses recorded this month"}

## Budget Status
${budgetSummary}

## Savings Goals
${goalSummary}

## Recent Transactions
${recentTxSummary}

## How to respond
- Always refer to the real numbers above when relevant
- Be direct and specific — say "you spent $X on Y" not "you might be spending on Y"
- Give actionable next steps, not just observations
- Keep replies concise — 3-5 sentences unless the user asks for detail`

    // ── Stream the response via native fetch ──────────────────────────────────
    const groqMessages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as GroqMessage["role"],
        content: m.content,
      })),
    ]

    const stream = await groqStream(groqMessages, { temperature: 0.7, max_tokens: 1024 })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("[CHAT_POST]", error)
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 })
  }
}
