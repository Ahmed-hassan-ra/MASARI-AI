import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "month" // month, quarter, year
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let dateFilter: { gte: Date; lte: Date }

    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else {
      // Default date ranges based on period
      const now = new Date()
      switch (period) {
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3)
          dateFilter = {
            gte: new Date(now.getFullYear(), quarter * 3, 1),
            lte: new Date(now.getFullYear(), quarter * 3 + 3, 0),
          }
          break
        case "year":
          dateFilter = {
            gte: new Date(now.getFullYear(), 0, 1),
            lte: new Date(now.getFullYear(), 11, 31),
          }
          break
        default: // month
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          }
      }
    }

    console.log(`[REPORTS_DATA] Fetching data for user ${session.user.id}, period: ${period}`)

    // Fetch current period data with optimized selects
    const [expenses, income] = await Promise.all([
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          date: dateFilter,
        },
        select: {
          id: true,
          date: true,
          amount: true,
          category: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.income.findMany({
        where: {
          userId: session.user.id,
          date: dateFilter,
        },
        select: {
          id: true,
          date: true,
          amount: true,
          category: true,
        },
        orderBy: { date: "desc" },
      }),
    ])

    console.log(`[REPORTS_DATA] Found ${expenses.length} expenses and ${income.length} income records`)

    // Calculate previous period for comparison - optimize by using aggregation
    const periodLength = dateFilter.lte.getTime() - dateFilter.gte.getTime()
    const prevPeriodEnd = new Date(dateFilter.gte.getTime() - 1)
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodLength)

    // Use aggregation for better performance on previous period data
    const [prevExpenseSum, prevIncomeSum] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId: session.user.id,
          date: {
            gte: prevPeriodStart,
            lte: prevPeriodEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.income.aggregate({
        where: {
          userId: session.user.id,
          date: {
            gte: prevPeriodStart,
            lte: prevPeriodEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    // Calculate current period totals
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // Calculate previous period totals from aggregation
    const prevTotalIncome = prevIncomeSum._sum.amount || 0
    const prevTotalExpenses = prevExpenseSum._sum.amount || 0
    const prevNetSavings = prevTotalIncome - prevTotalExpenses

    // Calculate percentage changes
    const incomeChange = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0
    const expenseChange = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0
    const savingsChange = prevNetSavings > 0 ? ((netSavings - prevNetSavings) / prevNetSavings) * 100 : 0

    // Group by category using Maps for better performance
    const expensesByCategory = new Map<string, number>()
    const incomeByCategory = new Map<string, number>()

    expenses.forEach(expense => {
      const current = expensesByCategory.get(expense.category) || 0
      expensesByCategory.set(expense.category, current + expense.amount)
    })

    income.forEach(incomeItem => {
      const current = incomeByCategory.get(incomeItem.category) || 0
      incomeByCategory.set(incomeItem.category, current + incomeItem.amount)
    })

    // Get monthly data for charts (last 6 months) - optimize with single query
    const monthlyData = []
    const currentDate = new Date()
    
    // Build all date ranges first
    const monthRanges = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)
      monthRanges.push({ start: monthStart, end: monthEnd, name: monthStart.toLocaleDateString('en-US', { month: 'short' }) })
    }

    // Fetch all monthly data in parallel using Promise.all for better performance
    const monthlyResults = await Promise.all(
      monthRanges.map(async (range) => {
        const [monthExpenseSum, monthIncomeSum] = await Promise.all([
          prisma.expense.aggregate({
            where: {
              userId: session.user.id,
              date: { gte: range.start, lte: range.end },
            },
            _sum: { amount: true },
          }),
          prisma.income.aggregate({
            where: {
              userId: session.user.id,
              date: { gte: range.start, lte: range.end },
            },
            _sum: { amount: true },
          }),
        ])

        const monthIncomeTotal = monthIncomeSum._sum.amount || 0
        const monthExpenseTotal = monthExpenseSum._sum.amount || 0

        return {
          name: range.name,
          income: monthIncomeTotal,
          expenses: monthExpenseTotal,
          savings: monthIncomeTotal - monthExpenseTotal,
        }
      })
    )

    monthlyData.push(...monthlyResults)

    const reportData = {
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        changes: {
          income: Math.round(incomeChange * 100) / 100,
          expenses: Math.round(expenseChange * 100) / 100,
          savings: Math.round(savingsChange * 100) / 100,
        },
      },
      categoryBreakdown: {
        income: Array.from(incomeByCategory.entries()).map(([category, amount]) => ({
          category,
          amount,
          percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 10000) / 100 : 0,
        })),
        expenses: Array.from(expensesByCategory.entries()).map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 10000) / 100 : 0,
        })),
      },
      monthlyData,
      period,
      dateRange: {
        start: dateFilter.gte.toISOString(),
        end: dateFilter.lte.toISOString(),
      },
    }

    console.log(`[REPORTS_DATA] Successfully processed report data`)

    return NextResponse.json(reportData, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error("[REPORTS_DATA] Error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Internal server error"
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes("database") || error.message.includes("prisma")) {
        errorMessage = "Database connection error. Please try again later."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please refresh the page."
        statusCode = 408
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: statusCode })
  }
} 