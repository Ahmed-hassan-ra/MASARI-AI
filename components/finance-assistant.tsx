"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Message { id: string; role: "user" | "assistant"; content: string }

const WELCOME: Message = {
  id: "welcome", role: "assistant",
  content: "👋 Hello! I'm your MA$ARI-AI financial assistant. How can I assist you today?",
}

const EXAMPLES = [
  "How can I improve my savings rate?",
  "What's a good budget for eating out?",
  "How do I start investing with little money?",
  "How much should I have in my emergency fund?",
]

export function FinanceAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return
    setError(null)
    setIsLoading(true)
    const userMsg: Message = { id: Date.now().toString(), role: "user", content }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok || !res.body) throw new Error(`Error ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data:")) continue
          const raw = line.slice(5).trim()
          if (raw === "[DONE]") break
          try {
            const { content: delta } = JSON.parse(raw)
            if (delta) setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + delta } : m))
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get a response.")
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: "#2D82B5" }} />
          Financial AI Assistant
        </CardTitle>
        <CardDescription>Ask me anything about personal finance, budgeting, or your financial goals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-[500px] pr-4">
          <div className="flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id}
                className={cn("flex w-max max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                  msg.role === "user" ? "ml-auto text-white" : "bg-muted")}
                style={msg.role === "user" ? { background: "#2D82B5" } : undefined}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback>
                      {msg.role === "assistant" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(q => (
            <Button key={q} variant="outline" size="sm" onClick={() => sendMessage(q)} disabled={isLoading}>{q}</Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={e => { e.preventDefault(); sendMessage(input) }} className="flex w-full gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything about your finances..." disabled={isLoading} />
          <Button type="submit" disabled={isLoading || !input.trim()}
            className="text-white border-0" style={{ background: "#2D82B5" }}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
