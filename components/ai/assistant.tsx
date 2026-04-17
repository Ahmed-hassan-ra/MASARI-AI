"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { Loader2, Send, ChevronDown, Sparkles, Bot } from "lucide-react"
import { useDevice } from "@/hooks/use-device"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hello! I'm your Masari AI financial assistant. I have access to your real income, expenses, budgets, and goals — so ask me anything specific about your finances and I'll give you advice based on your actual numbers.",
}

export function AIAssistant({ inline = false }: { inline?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(inline)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const device = useDevice()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (content: string): Promise<void> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }],
        }),
      })

      if (!response.ok) {
        let errorMessage = `Error: ${response.status}`
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {}
        throw new Error(errorMessage)
      }

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = { role: "assistant" as const, content: "" }
      let hasAddedMessage = false

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim()
              if (data === "[DONE]") break
              if (!data) continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantMessage.content += parsed.content
                  setMessages((prev) => {
                    if (!hasAddedMessage) {
                      hasAddedMessage = true
                      return [...prev, { ...assistantMessage }]
                    } else {
                      const next = [...prev]
                      next[next.length - 1] = { ...assistantMessage }
                      return next
                    }
                  })
                }
              } catch {}
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      if (!hasAddedMessage && assistantMessage.content) {
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      throw error
    }
  }

  const mutation = useMutation({
    mutationFn: sendMessage,
    onMutate: (content) => {
      const newMessage = { role: "user" as const, content }
      setMessages((prev) => [...prev, newMessage])
      return { newMessage }
    },
    onError: (error: Error, _content, context) => {
      if (context?.newMessage) {
        setMessages((prev) => prev.filter((msg) => msg !== context.newMessage))
      }
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || mutation.isPending) return
    const content = input.trim()
    setInput("")
    mutation.mutate(content)
  }

  // Inline mode (e.g. desktop sidebar)
  if (inline) {
    return (
      <div className="w-full rounded-xl border overflow-hidden flex flex-col" style={{ height: "500px" }}>
        <ChatPanel messages={messages} input={input} setInput={setInput} handleSubmit={handleSubmit} isPending={mutation.isPending} messagesEndRef={messagesEndRef} />
      </div>
    )
  }

  // Mobile: full-screen overlay when open
  if (device.isMobile) {
    return (
      <>
        {/* FAB */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-blue-600 px-4 h-12 shadow-lg shadow-primary/30 text-white font-medium text-sm transition-transform active:scale-95"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Chat</span>
            {/* pulse ring */}
            <span className="absolute -inset-0.5 rounded-full animate-ping bg-primary/30 pointer-events-none" />
          </button>
        )}

        {/* Full-screen overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-none">Financial Assistant</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Powered by MA$ARI AI</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  {message.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[78%] text-sm leading-relaxed",
                      message.role === "assistant"
                        ? "bg-muted rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {mutation.isPending && (
                <div className="flex justify-start">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t px-4 py-3 bg-background pb-safe">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your finances..."
                  disabled={mutation.isPending}
                  className="flex-1 rounded-full bg-muted border-0 px-4"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={mutation.isPending || !input.trim()}
                  className="rounded-full h-10 w-10 bg-primary shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop: floating card
  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-blue-600 px-4 h-12 shadow-lg shadow-primary/30 text-white font-medium text-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Chat</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] rounded-2xl border bg-background shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: "520px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">Financial Assistant</p>
                <p className="text-xs text-muted-foreground mt-0.5">Powered by MA$ARI AI</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-[78%] text-sm leading-relaxed",
                    message.role === "assistant"
                      ? "bg-muted rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-2 shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                disabled={mutation.isPending}
                className="flex-1 rounded-full bg-muted border-0 px-4"
              />
              <Button
                type="submit"
                size="icon"
                disabled={mutation.isPending || !input.trim()}
                className="rounded-full h-10 w-10 bg-primary shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ChatPanel({
  messages,
  input,
  setInput,
  handleSubmit,
  isPending,
  messagesEndRef,
}: {
  messages: Message[]
  input: string
  setInput: (v: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isPending: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.map((message, index) => (
          <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 max-w-[78%] text-sm leading-relaxed",
                message.role === "assistant"
                  ? "bg-muted rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-2 shrink-0">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="shrink-0 border-t px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your finances..."
            disabled={isPending}
            className="flex-1 rounded-full bg-muted border-0 px-4"
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="rounded-full h-10 w-10 bg-primary shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
