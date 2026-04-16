import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createWorker } from "tesseract.js"
import { groqJSON } from "@/lib/groq"

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Step 1: Extract text from image
    let extractedText = ""
    let ocrProvider = ""

    if (process.env.GOOGLE_VISION_API_KEY) {
      const result = await tryGoogleVision(imageBase64)
      if (result.success) {
        extractedText = result.text
        ocrProvider = "google-vision"
      }
    }

    if (!extractedText) {
      const result = await tryTesseract(imageBase64)
      if (result.success) {
        extractedText = result.text
        ocrProvider = "tesseract"
      }
    }

    if (!extractedText) {
      return NextResponse.json(
        { error: "Could not extract text from image. Try a clearer photo with better lighting." },
        { status: 422 }
      )
    }

    // Step 2: Parse extracted text into structured receipt data
    const parsedReceipt = await parseReceiptWithAI(extractedText)

    return NextResponse.json({
      success: true,
      extractedText,
      parsedReceipt,
      ocrProvider,
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

// ─── OCR Providers ────────────────────────────────────────────────────────────

async function tryGoogleVision(imageBase64: string): Promise<{ success: boolean; text: string }> {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY!
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Data },
              features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
            },
          ],
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    if (!response.ok) return { success: false, text: "" }

    const data = await response.json()
    const text: string = data.responses?.[0]?.fullTextAnnotation?.text ?? ""
    return { success: !!text, text }
  } catch {
    return { success: false, text: "" }
  }
}

async function tryTesseract(imageBase64: string): Promise<{ success: boolean; text: string }> {
  let worker
  try {
    worker = await createWorker("eng")
    const { data } = await worker.recognize(imageBase64)
    const text = data.text.trim()
    return { success: !!text, text }
  } catch (error) {
    console.error("[TESSERACT]", error)
    return { success: false, text: "" }
  } finally {
    await worker?.terminate()
  }
}

// ─── AI Parsing ───────────────────────────────────────────────────────────────

const PARSE_PROMPT = (text: string) => `
You are a receipt parser. Extract structured data from this receipt text and return ONLY valid JSON with no extra text.

RECEIPT TEXT:
${text}

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
- Use null for missing optional fields, not empty strings
- Extract ALL line items with their prices
- If a field cannot be determined, use a sensible default (0 for numbers, "Unknown" for strings)
- confidence should reflect how clearly the value was readable (0.0 to 1.0)
`.trim()

async function parseReceiptWithAI(text: string): Promise<ParsedReceipt> {
  if (process.env.GROQ_API_KEY) {
    const result = await parseWithGroq(text)
    if (result) return { ...result, rawText: text }
  }

  // Last resort: extract just the essentials with regex
  return basicFallbackParser(text)
}

async function parseWithGroq(text: string): Promise<Omit<ParsedReceipt, "rawText"> | null> {
  try {
    const content = await groqJSON(
      [{ role: "user", content: PARSE_PROMPT(text) }],
      { temperature: 0.1, max_tokens: 2000 }
    )
    return normaliseAIParsedData(JSON.parse(content))
  } catch (error) {
    console.error("[GROQ_PARSE]", error)
    return null
  }
}

// ─── Data Normalisation ───────────────────────────────────────────────────────

function normaliseAIParsedData(parsed: any): Omit<ParsedReceipt, "rawText"> {
  return {
    merchant: parsed.merchant || "Unknown Merchant",
    address: parsed.address ?? undefined,
    phone: parsed.phone ?? undefined,
    date: isValidDate(parsed.date) ? parsed.date : today(),
    time: parsed.time ?? undefined,
    total: toFloat(parsed.total),
    subtotal: toFloat(parsed.subtotal) || undefined,
    tax: toFloat(parsed.tax) || undefined,
    tip: toFloat(parsed.tip) || undefined,
    discount: toFloat(parsed.discount) || undefined,
    items: Array.isArray(parsed.items)
      ? parsed.items.map((item: any) => ({
          name: item.name || "Unknown Item",
          price: toFloat(item.price),
          quantity: parseInt(item.quantity) || 1,
          category: item.category || "General",
          confidence: toFloat(item.confidence) || 0.8,
        }))
      : [],
    paymentMethod: {
      method: parsed.paymentMethod?.method || "Unknown",
      lastFourDigits: parsed.paymentMethod?.lastFourDigits ?? undefined,
      amount: toFloat(parsed.paymentMethod?.amount),
      confidence: toFloat(parsed.paymentMethod?.confidence) || 0.7,
    },
    category: parsed.category || "Other",
    confidence: toFloat(parsed.confidence) || 0.5,
  }
}

// ─── Basic Fallback (no AI key) ───────────────────────────────────────────────

function basicFallbackParser(text: string): ParsedReceipt {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  // Total — largest dollar amount labelled total/amount/due
  let total = 0
  for (const line of lines) {
    if (/total|amount due|balance due/i.test(line)) {
      const match = line.match(/(\d+\.\d{2})/)
      if (match) total = Math.max(total, parseFloat(match[1]))
    }
  }

  // Date
  let date = today()
  for (const line of lines) {
    const match = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
    if (match) {
      const [, m, d, y] = match
      const year = y.length === 2 ? "20" + y : y
      date = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
      break
    }
  }

  // Merchant — first non-empty line that isn't a number or address
  const merchant = lines.find(
    (l) => l.length > 3 && !/^\d/.test(l) && !/receipt|tax|total/i.test(l)
  ) || "Unknown Merchant"

  return {
    merchant,
    date,
    total,
    items: [],
    paymentMethod: { method: "Unknown", amount: 0, confidence: 0.2 },
    category: "Other",
    confidence: 0.3,
    rawText: text,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
