"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, PlusCircle, Search, Wallet, BarChart3, CreditCard, Receipt, Menu, Loader2 } from "lucide-react"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseChart } from "@/components/expense-chart"
import { MonthSelector } from "@/components/month-selector"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ExpensesPage() {
  const [refreshExpenses, setRefreshExpenses] = useState(0)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Month selector state
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  const { toast } = useToast()
  
  const handleExpenseAdded = () => setRefreshExpenses((c) => c + 1)

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date
        })
      })
      
      if (res.ok) {
        setFormData({
          description: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split('T')[0]
        })
        handleExpenseAdded()
        setShowForm(false) // Hide form on mobile after successful submission
        toast({
          title: "Success",
          description: "Expense saved successfully"
        })
      } else {
        const error = await res.json()
        throw new Error(error.error || "Failed to save expense")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save expense",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

  const SideNavigation = () => (
    <nav className="flex flex-1 flex-col gap-2 px-2 py-4">
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/dashboard">
          <Wallet className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/budgets">
          <BarChart3 className="mr-2 h-4 w-4" />
          Budgets
        </Link>
      </Button>
      <Button variant="default" className="justify-start" asChild>
        <Link href="/expenses">
          <CreditCard className="mr-2 h-4 w-4" />
          Expenses
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/income">
          <DollarSign className="mr-2 h-4 w-4" />
          Income
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/receipts">
          <Receipt className="mr-2 h-4 w-4" />
          Receipts
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/reports">
          <BarChart3 className="mr-2 h-4 w-4" />
          Reports
        </Link>
      </Button>
    </nav>
  )

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center gap-2 px-2 py-4">
                <Wallet className="h-6 w-6" />
                <span className="font-semibold">MA$ARI-AI</span>
              </div>
              <SideNavigation />
            </SheetContent>
          </Sheet>
          
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Wallet className="h-6 w-6" />
            <span className="hidden sm:inline-block">MA$ARI-AI</span>
          </Link>
        </div>
        <nav className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/simple-settings">Settings</Link>
          </Button>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-48 flex-col border-r bg-background sm:flex">
          <SideNavigation />
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">Expense Tracking</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="sm:hidden w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {showForm ? "Hide Form" : "Add Expense"}
            </Button>
            <Button className="hidden sm:flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
          
          {/* Mobile form - only show when toggled */}
          {showForm && (
            <Card className="sm:hidden">
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
                <CardDescription>Record a new expense transaction.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="description-mobile">Description</Label>
                    <Input 
                      id="description-mobile" 
                      name="description" 
                      placeholder="e.g., Grocery shopping"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount-mobile">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="amount-mobile" 
                        name="amount" 
                        placeholder="0.00" 
                        className="pl-8" 
                        type="number" 
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category-mobile">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="category-mobile">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food & Groceries</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date-mobile">Date</Label>
                    <Input 
                      id="date-mobile" 
                      name="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Expense
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Desktop form */}
            <Card className="hidden sm:block flex-1 lg:max-w-md">
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
                <CardDescription>Record a new expense transaction.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      name="description" 
                      placeholder="e.g., Grocery shopping"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="amount" 
                        name="amount" 
                        placeholder="0.00" 
                        className="pl-8" 
                        type="number" 
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food & Groceries</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      name="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Expense
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
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
                          <CardDescription>Your expense transactions for {monthNames[selectedMonth]} {selectedYear}</CardDescription>
                        </div>
                        <MonthSelector
                          selectedMonth={selectedMonth}
                          selectedYear={selectedYear}
                          onMonthYearChange={handleMonthYearChange}
                          className="w-full sm:w-auto"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ExpenseList 
                        refreshKey={refreshExpenses} 
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="chart" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Expense Analytics</CardTitle>
                      <CardDescription>Visual breakdown of your spending patterns</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] sm:h-[400px]">
                      <ExpenseChart 
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
