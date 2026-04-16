import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const templateSchema = z.object({
  name: z.string().min(1),
  categories: z.array(
    z.object({
      name: z.string().min(1),
      amount: z.number().min(0),
    })
  ),
})

// Predefined templates
const defaultTemplates = [
  {
    id: "default-1",
    name: "Basic Monthly Budget",
    categories: [
      { name: "Housing", amount: 1200 },
      { name: "Food & Groceries", amount: 400 },
      { name: "Transportation", amount: 300 },
      { name: "Utilities", amount: 200 },
      { name: "Entertainment", amount: 150 },
      { name: "Healthcare", amount: 100 },
      { name: "Savings", amount: 300 },
    ],
  },
  {
    id: "default-2",
    name: "Student Budget",
    categories: [
      { name: "Tuition & Books", amount: 800 },
      { name: "Food", amount: 250 },
      { name: "Housing", amount: 600 },
      { name: "Transportation", amount: 100 },
      { name: "Entertainment", amount: 100 },
      { name: "Personal Care", amount: 50 },
    ],
  },
  {
    id: "default-3",
    name: "Family Budget",
    categories: [
      { name: "Housing", amount: 1800 },
      { name: "Food & Groceries", amount: 600 },
      { name: "Childcare", amount: 500 },
      { name: "Transportation", amount: 400 },
      { name: "Utilities", amount: 300 },
      { name: "Healthcare", amount: 200 },
      { name: "Education", amount: 150 },
      { name: "Entertainment", amount: 200 },
      { name: "Savings", amount: 500 },
    ],
  },
  {
    id: "default-4",
    name: "Minimalist Budget",
    categories: [
      { name: "Housing", amount: 800 },
      { name: "Food", amount: 200 },
      { name: "Transportation", amount: 150 },
      { name: "Utilities", amount: 100 },
      { name: "Savings", amount: 250 },
    ],
  },
]

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, return the default templates
    // In the future, you can store custom templates in the database
    return NextResponse.json(defaultTemplates)
  } catch (error) {
    console.error("[BUDGET_TEMPLATES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = templateSchema.parse(body)

    // For now, we'll just return a success response
    // In the future, you can store custom templates in the database
    const newTemplate = {
      id: Date.now().toString(),
      name: validatedData.name,
      categories: validatedData.categories,
    }

    return NextResponse.json(newTemplate)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[BUDGET_TEMPLATES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    const body = await req.json()
    const validatedData = templateSchema.parse(body)

    // For now, just return success
    const updatedTemplate = {
      id,
      name: validatedData.name,
      categories: validatedData.categories,
    }

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[BUDGET_TEMPLATES_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[BUDGET_TEMPLATES_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 