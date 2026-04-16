import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Helper function to escape CSV values
function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Helper function to validate date range
function validateDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format")
  }
  
  if (start > end) {
    throw new Error("Start date must be before end date")
  }
  
  // Limit to 2 years for performance
  const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
  if (daysDifference > 730) {
    throw new Error("Date range cannot exceed 2 years")
  }
  
  return { start, end }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const format = searchParams.get("format") || "json"

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ 
        error: "Missing required fields: startDate and endDate" 
      }, { status: 400 })
    }

    // Validate date range
    let dateRange
    try {
      dateRange = validateDateRange(startDateParam, endDateParam)
    } catch (error) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : "Invalid date range" 
      }, { status: 400 })
    }

    const { start: startDate, end: endDate } = dateRange

    // Use Promise.all for concurrent queries with optimized selects
    console.log(`[REPORTS_EXPORT] Fetching data for user ${session.user.id} from ${startDate.toISOString()} to ${endDate.toISOString()}`)
    
    const [expenses, income] = await Promise.all([
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          date: true,
          amount: true,
          category: true,
          description: true,
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.income.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          date: true,
          amount: true,
          category: true,
          description: true,
        },
        orderBy: {
          date: "desc",
        },
      }),
    ])

    console.log(`[REPORTS_EXPORT] Found ${expenses.length} expenses and ${income.length} income records`)

    // Calculate summary statistics
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // Group by category using Map for better performance
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

    if (format === "csv") {
      try {
        // Build CSV content more efficiently
        const csvRows = [
          // Header
          "Type,Date,Amount,Category,Description"
        ]
        
        // Add expenses
        expenses.forEach(expense => {
          csvRows.push([
            "Expense",
            expense.date.toISOString().split("T")[0],
            expense.amount.toString(),
            escapeCsvValue(expense.category),
            escapeCsvValue(expense.description || "")
          ].join(","))
        })
        
        // Add income
        income.forEach(incomeItem => {
          csvRows.push([
            "Income",
            incomeItem.date.toISOString().split("T")[0],
            incomeItem.amount.toString(),
            escapeCsvValue(incomeItem.category),
            escapeCsvValue(incomeItem.description || "")
          ].join(","))
        })

        const csvContent = csvRows.join("\n")

        // Return CSV with proper headers
        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv;charset=utf-8;",
            "Content-Disposition": `attachment; filename="financial-report-${startDateParam.split('T')[0]}-to-${endDateParam.split('T')[0]}.csv"`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
        })
      } catch (error) {
        console.error("[REPORTS_EXPORT] CSV generation error:", error)
        return NextResponse.json({ 
          error: "Failed to generate CSV report" 
        }, { status: 500 })
      }
    }

    // Prepare JSON response
    const reportData = {
      summary: {
        dateRange: {
          startDate: startDateParam,
          endDate: endDateParam,
        },
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        recordCounts: {
          income: income.length,
          expenses: expenses.length,
          total: income.length + expenses.length
        }
      },
      transactions: {
        income: income.map(item => ({
          id: item.id,
          date: item.date.toISOString().split('T')[0],
          amount: item.amount,
          category: item.category,
          description: item.description || "",
        })),
        expenses: expenses.map(item => ({
          id: item.id,
          date: item.date.toISOString().split('T')[0],
          amount: item.amount,
          category: item.category,
          description: item.description || "",
        })),
      },
      categoryBreakdown: {
        income: Object.fromEntries(incomeByCategory),
        expenses: Object.fromEntries(expensesByCategory),
      },
      generatedAt: new Date().toISOString(),
    }

    // Return JSON with proper headers
    return NextResponse.json(reportData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    })

  } catch (error) {
    console.error("[REPORTS_EXPORT] Unexpected error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Internal server error"
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes("database") || error.message.includes("prisma")) {
        errorMessage = "Database connection error. Please try again later."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try a smaller date range."
        statusCode = 408
      } else if (error.message.includes("memory")) {
        errorMessage = "Dataset too large. Please try a smaller date range."
        statusCode = 413
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: statusCode })
  }
} 