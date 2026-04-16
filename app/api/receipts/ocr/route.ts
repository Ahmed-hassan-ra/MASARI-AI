import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface ReceiptItem {
  name: string
  price: number
  quantity?: number
  category?: string
  confidence: number
}

interface PaymentInfo {
  method: string
  lastFourDigits?: string
  amount: number
  confidence: number
}

interface ParsedReceipt {
  merchant: string
  address?: string
  phone?: string
  date: string
  time?: string
  total: number
  subtotal?: number
  tax?: number
  tip?: number
  discount?: number
  items: ReceiptItem[]
  paymentMethod: PaymentInfo
  category: string
  confidence: number
  rawText: string
}

const RECEIPT_PROMPT = `You are a receipt parser. Look at this receipt image and extract all the data, then return ONLY a valid JSON object with no extra text or markdown.

Return this exact JSON structure:
{
  "merchant": "Store name",
  "address": "Store address or null",
  "phone": "Phone number or null",
  "date": "YYYY-MM-DD format",
  "time": "HH:MM format or null",
  "total": 0.00,
  "subtotal": 0.00,
  "tax": 0.00,
  "tip": 0.00,
  "discount": 0.00,
  "rawText": "the full text you can read from the receipt",
  "items": [
    {
      "name": "Item name",
      "price": 0.00,
      "quantity": 1,
      "category": "Food|Beverage|General|Healthcare|Automotive",
      "confidence": 0.9
    }
  ],
  "paymentMethod": {
    "method": "Cash|Card|Gift Card|Mobile Pay|Unknown",
    "lastFourDigits": "1234 or null",
    "amount": 0.00,
    "confidence": 0.9
  },
  "category": "Food & Dining|Groceries|Healthcare|Transportation|Shopping|Other",
  "confidence": 0.8
}

Rules:
- Use null for missing optional fields
- Extract ALL visible line items
- confidence should reflect how clearly each value was readable (0.0 to 1.0)
- Return ONLY the JSON object, no other text`

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const body = await req.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
    const mimeType = imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg"

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        temperature: 0.1,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: RECEIPT_PROMPT,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("[OCR_GROQ]", err)
      return NextResponse.json(
        { error: "Failed to process receipt image. Please try again." },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "Could not read the receipt. Try a clearer photo with better lighting." },
        { status: 422 }
      )
    }

    // Strip any accidental markdown code fences
    const clean = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim()

    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      console.error("[OCR_PARSE] Failed to parse JSON:", clean)
      return NextResponse.json(
        { error: "Could not parse receipt data. Try a clearer photo." },
        { status: 422 }
      )
    }

    const parsedReceipt = normalise(parsed)

    return NextResponse.json({
      success: true,
      extractedText: parsedReceipt.rawText,
      parsedReceipt,
      ocrProvider: "groq-vision",
      confidence: parsedReceipt.confidence,
      itemCount: parsedReceipt.items.length,
    })
  } catch (error) {
    console.error("[OCR_POST]", error)
    return NextResponse.json(
      { error: "Failed to process receipt image" },
      { status: 500 }
    )
  }
}

function normalise(p: any): ParsedReceipt {
  return {
    merchant: p.merchant || "Unknown Merchant",
    address: p.address ?? undefined,
    phone: p.phone ?? undefined,
    date: isValidDate(p.date) ? p.date : today(),
    time: p.time ?? undefined,
    total: toFloat(p.total),
    subtotal: toFloat(p.subtotal) || undefined,
    tax: toFloat(p.tax) || undefined,
    tip: toFloat(p.tip) || undefined,
    discount: toFloat(p.discount) || undefined,
    rawText: p.rawText || "",
    items: Array.isArray(p.items)
      ? p.items.map((item: any) => ({
          name: item.name || "Unknown Item",
          price: toFloat(item.price),
          quantity: parseInt(item.quantity) || 1,
          category: item.category || "General",
          confidence: toFloat(item.confidence) || 0.8,
        }))
      : [],
    paymentMethod: {
      method: p.paymentMethod?.method || "Unknown",
      lastFourDigits: p.paymentMethod?.lastFourDigits ?? undefined,
      amount: toFloat(p.paymentMethod?.amount),
      confidence: toFloat(p.paymentMethod?.confidence) || 0.7,
    },
    category: p.category || "Other",
    confidence: toFloat(p.confidence) || 0.5,
  }
}

function toFloat(value: any): number {
  const n = parseFloat(value)
  return isNaN(n) ? 0 : n
}

function isValidDate(str: any): boolean {
  if (typeof str !== "string") return false
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str))
}

function today(): string {
  return new Date().toISOString().split("T")[0]
}
