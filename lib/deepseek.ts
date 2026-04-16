/**
 * DeepSeek native fetch client — zero SDK dependency.
 * Uses the DeepSeek Chat Completions API directly via fetch.
 * https://api.deepseek.com/chat/completions
 */

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

export interface DSMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface DSRequestBase {
  model?: string
  messages: DSMessage[]
  temperature?: number
  max_tokens?: number
}

interface DSRequestJSON extends DSRequestBase {
  stream?: false
  response_format?: { type: "json_object" }
}

interface DSRequestStream extends DSRequestBase {
  stream: true
}

function headers() {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error("DEEPSEEK_API_KEY is not set")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  }
}

/** Fetch with automatic retry on 429 (rate limit) and 503 (overload) */
async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, init)
    if (res.status !== 429 && res.status !== 503) return res
    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
  }
  return fetch(url, init)
}

/** Single-shot JSON completion — returns the text content string */
export async function deepseekJSON(
  messages: DSMessage[],
  opts: Omit<DSRequestJSON, "messages"> = {}
): Promise<string> {
  const res = await fetchWithRetry(DEEPSEEK_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      ...opts,
      messages,
      stream: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty response from DeepSeek")
  return content
}

/** Streaming SSE completion — returns a ReadableStream of SSE text */
export async function deepseekStream(
  messages: DSMessage[],
  opts: Omit<DSRequestStream, "messages" | "stream"> = {}
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetchWithRetry(DEEPSEEK_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 4096,
      ...opts,
      messages,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek error ${res.status}: ${err}`)
  }

  if (!res.body) throw new Error("No response body from DeepSeek")

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  // Transform DeepSeek SSE → our SSE format { content: "..." }
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = res.body!.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split("\n")) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data:")) continue
            const raw = trimmed.slice(5).trim()
            if (raw === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              continue
            }
            try {
              const json = JSON.parse(raw)
              const content = json?.choices?.[0]?.delta?.content
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                )
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}
