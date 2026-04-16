import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { type, amount, description, category, date } = await req.json()

    if (!type || !amount || !description || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Ensure we have a valid user ID
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "",
          image: session.user.image || "",
        }
      })
    }

    if (type === "income") {
      const income = await prisma.income.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          description,
          category,
          date: new Date(date),
        },
      })
      return NextResponse.json(income)
    } else {
      const expense = await prisma.expense.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          description,
          category,
          date: new Date(date),
        },
      })
      return NextResponse.json(expense)
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Error creating transaction" },
      { status: 500 }
    )
  }
} 