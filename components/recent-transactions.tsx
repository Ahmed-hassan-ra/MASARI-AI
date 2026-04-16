"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type: "expense" | "income"
}

export function RecentTransactions({ refreshKey }: { refreshKey?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      try {
        const res = await fetch("/api/dashboard/summary")
        if (!res.ok) {
          setTransactions([])
          return
        }
        const data = await res.json()
        setTransactions(data.recentTransactions || [])
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [refreshKey])

  if (loading) return <div>Loading...</div>
  if (!transactions.length) return <div>No recent transactions.</div>

  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9 mr-3">
            <AvatarImage src={"/placeholder.svg"} alt="Avatar" />
            <AvatarFallback>{transaction.description?.charAt(0) || "T"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={transaction.type === "expense" ? "destructive" : "default"}>
              {transaction.type === "expense" ? "-" : "+"}${transaction.amount.toFixed(2)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

const transactions = [
  {
    id: "1",
    name: "Grocery Store",
    amount: 89.24,
    date: "May 20, 2025",
    type: "expense",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    name: "Salary Deposit",
    amount: 1500.0,
    date: "May 15, 2025",
    type: "income",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    name: "Electric Bill",
    amount: 85.0,
    date: "May 12, 2025",
    type: "expense",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    name: "Freelance Payment",
    amount: 250.0,
    date: "May 10, 2025",
    type: "income",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "5",
    name: "Restaurant",
    amount: 45.8,
    date: "May 8, 2025",
    type: "expense",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]
