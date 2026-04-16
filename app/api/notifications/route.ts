import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET /api/notifications - List notifications for current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(notifications)
}

// POST /api/notifications - Create a new notification
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { type, message } = await req.json()
  if (!type || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const notification = await prisma.notification.create({
    data: {
      userId: session.user.id,
      type,
      message,
    },
  })
  return NextResponse.json(notification)
} 