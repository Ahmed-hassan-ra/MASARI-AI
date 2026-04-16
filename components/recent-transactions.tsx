"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle } from "lucide-react"
import Link from "next/link"

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
      } catch {
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-muted-foreground" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <p className="text-muted-foreground text-sm">No transactions yet. Add income or expenses to see them here.</p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/income"><PlusCircle className="mr-2 h-4 w-4" />Add Income</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/expenses"><PlusCircle className="mr-2 h-4 w-4" />Add Expense</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9 mr-3">
            <AvatarFallback className="text-xs">
              {transaction.description?.charAt(0)?.toUpperCase() || "T"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">
              {transaction.category?.charAt(0).toUpperCase() + transaction.category?.slice(1)} · {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={transaction.type === "expense" ? "destructive" : "default"} className="ml-2 shrink-0">
            {transaction.type === "expense" ? "-" : "+"}${transaction.amount.toFixed(2)}
          </Badge>
        </div>
      ))}
    </div>
  )
}
