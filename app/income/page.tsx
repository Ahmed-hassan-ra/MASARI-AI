"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Search, Wallet, BarChart3, CreditCard, Receipt, Loader2, Menu, PlusCircle } from "lucide-react"
import { IncomeList } from "@/components/income-list"
import { IncomeChart } from "@/components/income-chart"
import { MonthSelector } from "@/components/month-selector"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function IncomePage() {
  const [refreshIncome, setRefreshIncome] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showForm, setShowForm] = useState(false)
  
  // Month selector state
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  const { toast } = useToast()

  const handleIncomeAdded = () => setRefreshIncome((c) => c + 1)

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      const description = formData.get("description") as string
      const amount = parseFloat(formData.get("amount") as string)
      const category = formData.get("category") as string
      const date = formData.get("date") as string

      // Validation
      if (!description || !amount || !category || !date) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (amount <= 0) {
        toast({
          title: "Error", 
          description: "Amount must be greater than 0",
          variant: "destructive",
        })
        return
      }

      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, category, date })
      })

      if (res.ok) {
        form.reset()
        setSelectedCategory("")
        setShowForm(false) // Hide form on mobile after successful submission
        handleIncomeAdded()
        toast({
          title: "Success",
          description: "Income added successfully",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add income",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding income:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/expenses">
          <CreditCard className="mr-2 h-4 w-4" />
          Expenses
        </Link>
      </Button>
      <Button variant="default" className="justify-start" asChild>
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
            <h1 className="text-2xl font-semibold">Income Tracking</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="sm:hidden w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {showForm ? "Hide Form" : "Add Income"}
            </Button>
          </div>

          {/* Mobile form - only show when toggled */}
          {showForm && (
            <Card className="sm:hidden">
              <CardHeader>
                <CardTitle>Add New Income</CardTitle>
                <CardDescription>Record a new income transaction.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="description-mobile">Description</Label>
                    <Input 
                      id="description-mobile" 
                      name="description" 
                      placeholder="e.g., Salary payment" 
                      required
                      disabled={isLoading}
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
                        min="0"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category-mobile">Category</Label>
                    <Select 
                      name="category" 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                      required
                      disabled={isLoading}
                    >
                      <SelectTrigger id="category-mobile">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="rental">Rental</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
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
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Income...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Income
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
                <CardTitle>Add New Income</CardTitle>
                <CardDescription>Record a new income transaction.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      name="description" 
                      placeholder="e.g., Salary payment" 
                      required
                      disabled={isLoading}
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
                        min="0"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      name="category" 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                      required
                      disabled={isLoading}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="rental">Rental</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
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
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Income...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Income
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="flex-1">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">Income List</TabsTrigger>
                  <TabsTrigger value="chart">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle>Recent Income</CardTitle>
                          <CardDescription>Your income transactions for {monthNames[selectedMonth]} {selectedYear}</CardDescription>
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
                      <IncomeList 
                        refreshKey={refreshIncome} 
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="chart" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Income Analytics</CardTitle>
                      <CardDescription>Visual breakdown of your income sources</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] sm:h-[400px]">
                      <IncomeChart 
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
