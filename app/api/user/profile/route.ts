import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, verify that the user exists in the database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      console.error("User not found in database:", session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Try to find existing profile, create one if it doesn't exist
    let profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // Create default profile if it doesn't exist
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          currency: "USD",
          language: "en",
          theme: "light",
          dateFormat: "MM/DD/YYYY",
          notifications: true,
        },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "An error occurred while fetching profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, verify that the user exists in the database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      console.error("User not found in database:", session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { currency, language, theme, dateFormat, notifications } = await req.json()

    // Try to update existing profile, create one if it doesn't exist
    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        currency,
        language,
        theme,
        dateFormat,
        notifications,
      },
      create: {
        userId: session.user.id,
        currency,
        language,
        theme,
        dateFormat,
        notifications,
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "An error occurred while updating profile" }, { status: 500 })
  }
}
