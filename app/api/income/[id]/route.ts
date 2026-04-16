import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Income ID is required" }, { status: 400 })
    }

    // Check if the income exists and belongs to the user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingIncome) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    // Delete the income
    await prisma.income.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Income deleted successfully" })
  } catch (error) {
    console.error("Error deleting income:", error)
    return NextResponse.json({ error: "An error occurred while deleting income" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { description, amount, date, category } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Income ID is required" }, { status: 400 })
    }

    // Validate input
    if (!description || !amount || !date || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the income exists and belongs to the user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingIncome) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    // Update the income
    const updatedIncome = await prisma.income.update({
      where: {
        id,
      },
      data: {
        description,
        amount,
        date: new Date(date),
        category,
      },
    })

    return NextResponse.json(updatedIncome)
  } catch (error) {
    console.error("Error updating income:", error)
    return NextResponse.json({ error: "An error occurred while updating income" }, { status: 500 })
  }
} 