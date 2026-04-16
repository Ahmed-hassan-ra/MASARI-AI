"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Loader2, Send, Minimize2, Bot } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hello! I'm your AI financial assistant powered by LLaMA 3. I can help you with budgeting, expense tracking, and financial advice. How can I assist you today?",
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isMinimized, setIsMinimized] = useState(true)
  const { toast } = useToast()

  const sendMessage = async (content: string): Promise<void> => {
    try {
    const response = await fetch("/api/ai/chat", {
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
        } catch (e) {
          // If we can't parse the error response, use the status
        }
        throw new Error(errorMessage)
    }

    if (!response.body) {
      throw new Error("No response body")
    }

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
                  
              // Update the message in real-time
              setMessages((prev) => {
                    if (!hasAddedMessage) {
                      hasAddedMessage = true
                      return [...prev, { ...assistantMessage }]
                    } else {
                      const newMessages = [...prev]
                      newMessages[newMessages.length - 1] = { ...assistantMessage }
                      return newMessages
                    }
              })
                }
            } catch (e) {
                console.warn("Failed to parse chunk:", data, e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
      }

      // Ensure we have a final message
      if (!hasAddedMessage && assistantMessage.content) {
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
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
    onError: (error: Error, content, context) => {
      // Remove the user message that failed to send
      if (context?.newMessage) {
        setMessages((prev) => 
          prev.filter(msg => msg !== context.newMessage)
        )
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      // Message was sent successfully, no need to do anything
      // The streaming response will handle adding the assistant's response
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || mutation.isPending) return
    const content = input.trim()
    setInput("")
    mutation.mutate(content)
  }

  if (isMinimized) {
    return (
      <Button
        className="rounded-full p-4 h-14 w-14"
        onClick={() => setIsMinimized(false)}
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Financial Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(true)}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your finances..."
            disabled={mutation.isPending}
          />
          <Button type="submit" disabled={mutation.isPending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
} 