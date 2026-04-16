import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(
  req: Request,
  { params }: { params: { budgetId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budgetId = params.budgetId

    // Verify budget belongs to user and delete
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: session.user.id,
      },
    })

    if (!budget) {
      return new NextResponse("Budget not found", { status: 404 })
    }

    // Delete budget categories first (due to foreign key constraint)
    await prisma.budgetCategory.deleteMany({
      where: { budgetId: budgetId },
    })

    // Delete budget
    await prisma.budget.delete({
      where: { id: budgetId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[BUDGET_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { budgetId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budgetId = params.budgetId

    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: session.user.id,
      },
      include: {
        categories: true,
      },
    })

    if (!budget) {
      return new NextResponse("Budget not found", { status: 404 })
    }

    // Calculate spent amounts for each category
    const categoriesWithSpent = await Promise.all(
      budget.categories.map(async (category) => {
        const expenses = await prisma.expense.findMany({
          where: {
            userId: session.user.id,
            category: category.name,
            date: {
              gte: budget.startDate,
            },
          },
        })

        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          ...category,
          spent,
        }
      })
    )

    return NextResponse.json({
      ...budget,
      categories: categoriesWithSpent,
    })
  } catch (error) {
    console.error("[BUDGET_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 