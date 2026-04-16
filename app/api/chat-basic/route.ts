import { NextResponse } from "next/server"

// Predefined responses for common financial questions
const FALLBACK_RESPONSES: Record<string, string> = {
  default:
    "I'm your MA$ARI-AI financial assistant. I can help with budgeting advice, saving tips, and answering your financial questions. How can I assist you today?",
  savings:
    "Based on your current savings rate of 40.8%, you're doing well! To improve further, consider automating your savings, reducing discretionary spending, and looking for additional income sources.",
  budget:
    "A good budget follows the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. For eating out specifically, aim to keep it under 5-10% of your total budget.",
  investing:
    "To start investing with little money, consider micro-investing apps, low-cost index funds, or contributing to your employer's retirement plan. Even $50 per month can grow significantly over time.",
  expenses:
    "To reduce monthly expenses, review subscriptions, negotiate bills, meal plan to reduce food costs, and consider energy-saving measures for utilities. Your housing costs ($1,200) are your largest expense.",
  emergency:
    "For an emergency fund, aim to save 3-6 months of essential expenses. Based on your monthly expenses of $2,042, you should target between $6,126 and $12,252 in your emergency fund.",
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json().catch(() => ({}))
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        {
          status: 400,
        },
      )
    }

    // Simple keyword matching for fallback responses
    let response = FALLBACK_RESPONSES.default
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("saving") || lowerMessage.includes("save more")) {
      response = FALLBACK_RESPONSES.savings
    } else if (
      lowerMessage.includes("budget") ||
      lowerMessage.includes("eating out") ||
      lowerMessage.includes("spending")
    ) {
      response = FALLBACK_RESPONSES.budget
    } else if (lowerMessage.includes("invest") || lowerMessage.includes("investing")) {
      response = FALLBACK_RESPONSES.investing
    } else if (
      lowerMessage.includes("reduce") ||
      lowerMessage.includes("expenses") ||
      lowerMessage.includes("spending")
    ) {
      response = FALLBACK_RESPONSES.expenses
    } else if (lowerMessage.includes("emergency") || lowerMessage.includes("fund")) {
      response = FALLBACK_RESPONSES.emergency
    }

    // Return the response
    return NextResponse.json({
      content: response,
      role: "assistant",
    })
  } catch (error) {
    console.error("Error in basic chat API:", error)
    return NextResponse.json(
      {
        error: "There was a problem processing your request",
      },
      {
        status: 500,
      },
    )
  }
}
