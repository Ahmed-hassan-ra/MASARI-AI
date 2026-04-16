import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get current month's start and end dates
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get previous month's start and end dates
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get current month's income and expenses
    const currentMonthIncome = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const currentMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Get previous month's income and expenses
    const previousMonthIncome = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const previousMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Get recent transactions
    const recentExpenses = await prisma.expense.findMany({
        where: {
        userId,
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
    })

    const recentIncomes = await prisma.income.findMany({
        where: {
        userId,
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
    })

    // Combine and sort transactions
    const recentTransactions = [
      ...recentExpenses.map(expense => ({
        ...expense,
        type: "expense" as const,
      })),
      ...recentIncomes.map(income => ({
        ...income,
        type: "income" as const,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    const currentIncome = currentMonthIncome._sum.amount || 0
    const currentExpenses = currentMonthExpenses._sum.amount || 0
    const previousIncome = previousMonthIncome._sum.amount || 0
    const previousExpenses = previousMonthExpenses._sum.amount || 0

    const balance = currentIncome - currentExpenses
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0
    const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0
    const expensesChange = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0

    return NextResponse.json({
      balance,
      income: currentIncome,
      expenses: currentExpenses,
      savingsRate,
      incomeChange,
      expensesChange,
      recentTransactions,
    })
  } catch (error) {
    console.error("[DASHBOARD_SUMMARY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
