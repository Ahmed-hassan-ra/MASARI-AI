"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Loader2, PlusCircle } from "lucide-react"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseChart } from "@/components/expense-chart"
import { MonthSelector } from "@/components/month-selector"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ExpensesPage() {
  const [refreshExpenses, setRefreshExpenses] = useState(0)
  const [formData, setFormData] = useState({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0] })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const { toast } = useToast()

  const handleExpenseAdded = () => setRefreshExpenses(c => c + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }),
      })
      if (res.ok) {
        setFormData({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0] })
        handleExpenseAdded()
        toast({ title: "Success", description: "Expense saved successfully" })
      } else {
        const error = await res.json()
        throw new Error(error.error || "Failed to save expense")
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save expense", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const categories = ["food","transportation","housing","utilities","healthcare","entertainment","shopping","education","other"]

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Expense Tracking</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Add Expense Form */}
        <Card className="lg:max-w-md w-full">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>Record a new expense transaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="e.g., Grocery shopping" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="amount" placeholder="0.00" className="pl-8" type="number" step="0.01" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))} disabled={isSubmitting}>
                  <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} disabled={isSubmitting} />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><PlusCircle className="mr-2 h-4 w-4" />Add Expense</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Expense List + Chart */}
        <div className="flex-1">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Expense List</TabsTrigger>
              <TabsTrigger value="chart">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Recent Expenses</CardTitle>
                      <CardDescription>Your expenses for {monthNames[selectedMonth]} {selectedYear}</CardDescription>
                    </div>
                    <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthYearChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ExpenseList refreshKey={refreshExpenses} selectedMonth={selectedMonth} selectedYear={selectedYear} onChanged={handleExpenseAdded} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="chart" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Analytics</CardTitle>
                  <CardDescription>Visual breakdown of your spending patterns</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ExpenseChart selectedMonth={selectedMonth} selectedYear={selectedYear} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
