import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserProfileForm } from "@/components/profile/user-profile-form"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  // First, verify that the user exists in the database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  if (!user) {
    console.error("User not found in database:", session.user.id)
    redirect("/auth/login")
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

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Profile</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfileForm user={user} profile={profile} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
