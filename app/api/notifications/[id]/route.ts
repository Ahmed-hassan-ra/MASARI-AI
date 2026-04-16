import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// PUT /api/notifications/[id] - Mark as read
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = params
  const notification = await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  })
  return NextResponse.json(notification)
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = params
  await prisma.notification.delete({
    where: { id, userId: session.user.id },
  })
  return NextResponse.json({ success: true })
} 