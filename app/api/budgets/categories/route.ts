import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, amount } = await req.json()

    if (!name || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the current active budget
    const currentBudget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startDate: "desc",
      },
    })

    if (!currentBudget) {
      return NextResponse.json(
        { error: "No active budget found" },
        { status: 400 }
      )
    }

    // Create the category
    const category = await prisma.budgetCategory.create({
      data: {
        budgetId: currentBudget.id,
        name,
        amount: parseFloat(amount),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating budget category:", error)
    return NextResponse.json(
      { error: "Error creating budget category" },
      { status: 500 }
    )
  }
} 