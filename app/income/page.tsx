"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Loader2, PlusCircle } from "lucide-react"
import { IncomeList } from "@/components/income-list"
import { IncomeChart } from "@/components/income-chart"
import { MonthSelector } from "@/components/month-selector"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function IncomePage() {
  const [refreshIncome, setRefreshIncome] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const { toast } = useToast()

  const handleIncomeAdded = () => setRefreshIncome(c => c + 1)

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

      if (!description || !amount || !category || !date) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
        return
      }

      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, category, date }),
      })

      if (res.ok) {
        form.reset()
        setSelectedCategory("")
        handleIncomeAdded()
        toast({ title: "Success", description: "Income added successfully" })
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to add income", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Income Tracking</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Add Income Form */}
        <Card className="lg:max-w-md w-full">
          <CardHeader>
            <CardTitle>Add New Income</CardTitle>
            <CardDescription>Record a new income transaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="e.g., Salary payment" required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="amount" name="amount" placeholder="0.00" className="pl-8" type="number" step="0.01" min="0" required disabled={isLoading} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory} required disabled={isLoading}>
                  <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {["salary","freelance","business","investment","rental","bonus","other"].map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()} required disabled={isLoading} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><PlusCircle className="mr-2 h-4 w-4" />Add Income</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Income List + Chart */}
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
                      <CardDescription>Your income for {monthNames[selectedMonth]} {selectedYear}</CardDescription>
                    </div>
                    <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthYearChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <IncomeList refreshKey={refreshIncome} selectedMonth={selectedMonth} selectedYear={selectedYear} onChanged={handleIncomeAdded} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="chart" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Income Analytics</CardTitle>
                  <CardDescription>Visual breakdown of your income sources</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <IncomeChart selectedMonth={selectedMonth} selectedYear={selectedYear} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
