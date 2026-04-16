import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const budgetCreateSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  period: z.string(),
  startDate: z.string(),
  categories: z.array(
    z.object({
      name: z.string().min(1),
      amount: z.number().min(0),
    })
  ),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id },
      include: {
        categories: true,
      },
      orderBy: { startDate: "desc" },
    })

    // Calculate spent amounts for each category
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
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

        return {
          ...budget,
          categories: categoriesWithSpent,
        }
      })
    )

    return NextResponse.json(budgetsWithSpent)
  } catch (error) {
    console.error("[BUDGETS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      // Create user if it doesn't exist
      await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "",
        },
      })
    }

    const body = await req.json()
    const validatedData = budgetCreateSchema.parse(body)

    const budget = await prisma.budget.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        period: validatedData.period,
        startDate: new Date(validatedData.startDate),
        userId: session.user.id,
        categories: {
          create: validatedData.categories.map((category) => ({
            name: category.name,
            amount: category.amount,
          })),
        },
      },
      include: {
        categories: true,
      },
    })

    return NextResponse.json(budget)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[BUDGETS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
