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

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        targetDate: "asc",
      },
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "An error occurred while fetching goals" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, targetAmount, currentAmount, startDate, targetDate, category, priority, notes } = await req.json()

    // Validate input
    if (!name || !targetAmount || !startDate || !targetDate || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name,
        targetAmount,
        currentAmount: currentAmount || 0,
        startDate: new Date(startDate),
        targetDate: new Date(targetDate),
        category,
        priority: priority || "medium",
        notes,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "An error occurred while creating goal" }, { status: 500 })
  }
}
