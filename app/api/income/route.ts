import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : undefined

    // Build filter conditions
    const where: any = {
      userId: session.user.id,
    }

    if (category) {
      where.category = category
    }

    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate),
      }
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      take: limit,
    })

    return NextResponse.json(incomes)
  } catch (error) {
    console.error("Error fetching incomes:", error)
    return NextResponse.json({ error: "An error occurred while fetching incomes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description, amount, date, category } = await req.json()

    // Validate input
    if (!description || !amount || !date || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create income
    const income = await prisma.income.create({
      data: {
        userId: session.user.id,
        description,
        amount,
        date: new Date(date),
        category,
      },
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error("Error creating income:", error)
    return NextResponse.json({ error: "An error occurred while creating income" }, { status: 500 })
  }
}
