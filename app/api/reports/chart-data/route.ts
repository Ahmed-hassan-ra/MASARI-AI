import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get data for the last 6 months
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const [incomeData, expenseData] = await Promise.all([
        prisma.income.aggregate({
          where: {
            userId,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.expense.aggregate({
          where: {
            userId,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ])

      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        income: incomeData._sum.amount || 0,
        expenses: expenseData._sum.amount || 0,
      })
    }

    return NextResponse.json(months)
  } catch (error) {
    console.error("[CHART_DATA]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 