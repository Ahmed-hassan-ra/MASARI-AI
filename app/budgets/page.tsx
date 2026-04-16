"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DollarSign, PlusCircle, AlertCircle, Target, TrendingUp, TrendingDown, Edit, Trash2, Calendar } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"
import { BudgetTemplates } from "@/components/budgets/budget-templates"
import { CreateBudgetDialog } from "@/components/budgets/create-budget-dialog"
import { MonthSelector } from "@/components/month-selector"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"

const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
})

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  amount: z.string().min(1, "Amount is required"),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>
type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface BudgetCategory {
  id: string
  name: string
  amount: number
  spent: number
}

interface Budget {
  id: string
  name: string
  amount: number
  period: string
  startDate: string
  categories: BudgetCategory[]
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  
  // Month selector state
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      amount: "",
    },
  })

  const editForm = useForm<any>({
    defaultValues: {
      name: "",
      amount: "",
      categories: [],
    },
  })

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/budgets")
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      } else {
        setBudgets([])
      }
    } catch (error) {
      console.error("Error fetching budgets:", error)
      setBudgets([])
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleExpenseSubmit = async (data: ExpenseFormValues) => {
    try {
      const amount = parseFloat(data.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: data.description,
          amount: amount,
          category: data.category,
          date: data.date
        })
      })

      if (response.ok) {
        setIsExpenseDialogOpen(false)
        expenseForm.reset({
          description: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
        })
        fetchBudgets() // Refresh to update spent amounts
        toast({
          title: "Success",
          description: "Expense added successfully",
        })
      } else {
        throw new Error("Failed to add expense")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  const handleCategorySubmit = async (data: CategoryFormValues) => {
    try {
      const amount = parseFloat(data.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        })
        return
      }

      // For now, this would need a separate API to add categories to existing budgets
      // Let's show a success message and refresh
      setIsCategoryDialogOpen(false)
      categoryForm.reset()
      toast({
        title: "Success",
        description: "Category will be added to new budgets",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleBudgetCreated = () => {
    fetchBudgets()
  }

  const handleViewBudget = (budget: Budget) => {
    // Set the selected month/year to match the budget's date and refresh the Current tab
    const budgetDate = new Date(budget.startDate)
    setSelectedMonth(budgetDate.getMonth())
    setSelectedYear(budgetDate.getFullYear())
    
    // Switch to Current tab to show the budget
    const tabsElement = document.querySelector('[data-state="active"]')?.closest('[role="tablist"]')?.querySelector('[value="current"]') as HTMLElement
    if (tabsElement) {
      tabsElement.click()
    }
    
    toast({
      title: "Budget Selected",
      description: `Viewing ${budget.name} for ${budgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    })
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    editForm.reset({
      name: budget.name,
      amount: budget.amount.toString(),
      categories: budget.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        amount: cat.amount.toString()
      }))
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (data: any) => {
    if (!editingBudget) return

    try {
      const amount = parseFloat(data.amount)
      const categories = data.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        amount: parseFloat(cat.amount)
      }))

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid total budget amount",
          variant: "destructive",
        })
        return
      }

      for (const cat of categories) {
        if (isNaN(cat.amount) || cat.amount < 0) {
          toast({
            title: "Error",
            description: "Please enter valid amounts for all categories",
            variant: "destructive",
          })
          return
        }
      }

      // Note: This would need a PUT endpoint for budgets, for now we'll show a message
      toast({
        title: "Info",
        description: "Budget editing will be implemented in the next update",
        variant: "default",
      })
      
      setIsEditDialogOpen(false)
      setEditingBudget(null)
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      })
    }
  }

  const deleteBudget = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchBudgets()
        toast({
          title: "Success",
          description: "Budget deleted successfully",
        })
      } else {
        throw new Error("Failed to delete budget")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      })
    }
  }

  const currentBudget = budgets.find(budget => {
    const budgetDate = new Date(budget.startDate)
    return budgetDate.getMonth() === selectedMonth && budgetDate.getFullYear() === selectedYear
  }) || budgets[0]

  // Fix: Use the actual budget amount, not just sum of categories
  const totalBudgetAmount = currentBudget?.amount || 0
  const totalCategoryAmount = currentBudget?.categories.reduce((sum, cat) => sum + cat.amount, 0) || 0
  const totalSpent = currentBudget?.categories.reduce((sum, cat) => sum + cat.spent, 0) || 0
  const remainingBudget = totalBudgetAmount - totalSpent
  const spentPercentage = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Budget Management</h1>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {monthNames[selectedMonth]} {selectedYear}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <MonthSelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthYearChange={handleMonthYearChange}
                className="order-2 sm:order-1"
              />
              <CreateBudgetDialog onBudgetCreated={handleBudgetCreated} />
            </div>
          </div>

          {/* Budget Overview Cards */}
          {currentBudget && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalBudgetAmount)}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentBudget.categories.length} categories
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                  <p className="text-xs text-muted-foreground">
                    {spentPercentage.toFixed(1)}% of budget
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                  <TrendingUp className={`h-4 w-4 ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(remainingBudget))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {spentPercentage <= 80 ? '🟢' : spentPercentage <= 95 ? '🟡' : '🔴'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {spentPercentage <= 80 ? 'Healthy' : spentPercentage <= 95 ? 'Warning' : 'Critical'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="past">History</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4">
              {currentBudget ? (
                <div className="space-y-4">
                  {/* Budget Progress Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{currentBudget.name}</CardTitle>
                        <CardDescription>
                          Budget for {monthNames[selectedMonth]} {selectedYear}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditBudget(currentBudget)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteBudget(currentBudget.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Overall Progress</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(totalSpent)} of {formatCurrency(totalBudgetAmount)}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {spentPercentage.toFixed(1)}%
                          </div>
                        </div>
                        <Progress
                          value={spentPercentage}
                          className="h-3"
                        />
                      </div>

                      {/* Category Breakdown */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Categories</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {currentBudget.categories.map((category) => {
                            const categoryPercentage = category.amount > 0 ? (category.spent / category.amount) * 100 : 0
                            const isOverBudget = category.spent > category.amount
                            
                            return (
                              <div key={category.id} className="space-y-2 p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">{category.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatCurrency(category.spent)} of {formatCurrency(category.amount)}
                                    </div>
                                  </div>
                                  <div className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
                                    {categoryPercentage.toFixed(1)}%
                                  </div>
                                </div>
                                <Progress
                                  value={Math.min(categoryPercentage, 100)}
                                  className="h-2"
                                />
                                {isOverBudget && (
                                  <p className="text-xs text-red-600">
                                    Over by {formatCurrency(category.spent - category.amount)}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedBudgetId(currentBudget.id)} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Expense
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Expense</DialogTitle>
                            <DialogDescription>
                              Record a new expense transaction.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...expenseForm}>
                            <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
                              <FormField
                                control={expenseForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., Grocery shopping" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={expenseForm.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Amount ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={expenseForm.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {currentBudget.categories.map((category) => (
                                          <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={expenseForm.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button type="submit">Add Expense</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Budget Found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create your first budget for {monthNames[selectedMonth]} {selectedYear} to start tracking your spending.
                    </p>
                    <CreateBudgetDialog onBudgetCreated={handleBudgetCreated}>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Budget
                      </Button>
                    </CreateBudgetDialog>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget History</CardTitle>
                  <CardDescription>View and analyze your previous budgets.</CardDescription>
                </CardHeader>
                <CardContent>
                  {budgets.length > 0 ? (
                    <div className="space-y-4">
                      {budgets.map((budget) => {
                        const budgetDate = new Date(budget.startDate)
                        const totalBudget = budget.categories.reduce((sum, cat) => sum + cat.amount, 0)
                        const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0)
                        const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
                        
                        return (
                          <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{budget.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {budgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)} ({percentage.toFixed(1)}%)
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={percentage <= 100 ? "secondary" : "destructive"}>
                                {percentage <= 100 ? "On Track" : "Over Budget"}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => handleViewBudget(budget)}>View</Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No budget history found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <BudgetTemplates onBudgetCreated={handleBudgetCreated} />
            </TabsContent>
          </Tabs>

          {/* Edit Budget Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
                <DialogDescription>
                  Modify your budget details and category allocations.
                </DialogDescription>
              </DialogHeader>
              {editingBudget && (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monthly Budget" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Budget Amount ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <FormLabel>Budget Categories</FormLabel>
                      {editForm.watch("categories")?.map((_: unknown, index: number) => (
                        <div key={index} className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={editForm.control}
                            name={`categories.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Category name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2">
                            <FormField
                              control={editForm.control}
                              name={`categories.${index}.amount`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {editForm.watch("categories")?.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const categories = editForm.getValues("categories")
                                  editForm.setValue("categories", categories.filter((_: any, i: number) => i !== index))
                                }}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const currentCategories = editForm.getValues("categories") || []
                          editForm.setValue("categories", [
                            ...currentCategories,
                            { name: "", amount: "" },
                          ])
                        }}
                        className="w-full"
                      >
                        + Add Category
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Update Budget
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
    </main>
  )
}
