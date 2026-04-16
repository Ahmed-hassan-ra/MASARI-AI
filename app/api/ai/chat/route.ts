import { NextResponse } from "next/server"
import { z } from "zod"
import { groqStream, type GroqMessage } from "@/lib/groq"

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
})

const requestSchema = z.object({
  messages: z.array(messageSchema),
})

const SYSTEM_PROMPT: GroqMessage = {
  role: "system",
  content: `You are a helpful and knowledgeable financial assistant. You help users with:
- Budgeting and expense tracking
- Financial planning and advice
- Investment strategies
- Debt management
- Saving tips and tricks
- Understanding financial terms and concepts

Always provide clear, actionable advice and explain financial concepts in simple terms.
If you are unsure about something, acknowledge it and suggest consulting with a financial professional.

Current application context: The user is using MASARI-AI Finance, a personal finance management
application that helps track budgets, expenses, and financial goals.`,
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const body = await req.json()
    const { messages } = requestSchema.parse(body)

    const stream = await groqStream([
      SYSTEM_PROMPT,
      ...messages.map(m => ({ role: m.role, content: m.content } as GroqMessage)),
    ])

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 422 })
    }
    console.error("[CHAT_POST]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
