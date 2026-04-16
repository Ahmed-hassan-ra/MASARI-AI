"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message { id: string; role: "user" | "assistant"; content: string }

const WELCOME: Message = {
  id: "welcome", role: "assistant",
  content: "👋 Hello! I'm your MA$ARI-AI financial assistant. How can I assist you today?",
}

export function FinanceAssistantSimple() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const send = async (content: string) => {
    if (!content.trim() || isLoading) return
    setIsLoading(true)
    const userMsg: Message = { id: Date.now().toString(), role: "user", content }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    const aId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: aId, role: "assistant", content: "" }])
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
            if (delta) setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: m.content + delta } : m))
          } catch { /* skip */ }
        }
      }
    } catch { /* silent */ } finally { setIsLoading(false) }
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
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id}
                className={cn("flex w-max max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                  msg.role === "user" ? "ml-auto text-white" : "bg-muted")}
                style={msg.role === "user" ? { background: "#2D82B5" } : undefined}>
                <Avatar className="h-5 w-5">
                  <AvatarFallback>
                    {msg.role === "assistant" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex w-full gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask a financial question..." disabled={isLoading} className="flex-1" />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}
            className="text-white border-0" style={{ background: "#2D82B5" }}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
