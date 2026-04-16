import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const categoryCreateSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
})

export async function POST(
  req: Request,
  { params }: { params: { budgetId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = categoryCreateSchema.parse(body)

    // Verify budget ownership
    const budget = await prisma.budget.findUnique({
      where: {
        id: params.budgetId,
        userId: session.user.id,
      },
    })

    if (!budget) {
      return new NextResponse("Budget not found", { status: 404 })
    }

    // Create category
    const category = await prisma.budgetCategory.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        budgetId: params.budgetId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[BUDGET_CATEGORIES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 