"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  amount: number
  spent: number
}

interface Budget {
  id: string
  name: string
  amount: number
  startDate: string
  endDate: string | null
  categories: Category[]
}

export function useBudget() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")
      if (!response.ok) throw new Error("Failed to fetch budgets")
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const createBudget = async (data: any) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create budget")
      await fetchBudgets()
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      })
      return false
    }
  }

  const updateBudget = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update budget")
      await fetchBudgets()
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      })
      return false
    }
  }

  const addExpense = async (budgetId: string, data: any) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to add expense")
      await fetchBudgets()
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
      return false
    }
  }

  const addCategory = async (budgetId: string, data: any) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to add category")
      await fetchBudgets()
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    budgets,
    loading,
    createBudget,
    updateBudget,
    addExpense,
    addCategory,
    refreshBudgets: fetchBudgets,
  }
} 