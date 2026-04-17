import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // BudgetTemplate has no cascade relation — delete manually first
    const templates = await prisma.budgetTemplate.findMany({ where: { userId } })
    for (const t of templates) {
      await prisma.budgetTemplateCategory.deleteMany({ where: { templateId: t.id } })
    }
    await prisma.budgetTemplate.deleteMany({ where: { userId } })

    // Deleting the user cascades: Account, Session, Profile, Income, Expense,
    // Budget (→ BudgetCategory), Notification, Receipt, Goal
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
