"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReactNode } from "react"

const budgetFormSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  amount: z.string().min(1, "Amount is required"),
  categories: z.array(
    z.object({
      name: z.string().min(1, "Category name is required"),
      amount: z.string().min(1, "Amount is required"),
    })
  ).min(1, "At least one category is required"),
})

type BudgetFormValues = z.infer<typeof budgetFormSchema>

interface CreateBudgetDialogProps {
  onBudgetCreated?: () => void
  children?: ReactNode
}

export function CreateBudgetDialog({ onBudgetCreated, children }: CreateBudgetDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      categories: [{ name: "", amount: "" }],
    },
  })

  const onSubmit = async (data: BudgetFormValues) => {
    setIsLoading(true)
    try {
      // Parse string values to numbers
      const amount = parseFloat(data.amount)
      const categories = data.categories.map(cat => ({
        name: cat.name,
        amount: parseFloat(cat.amount)
      }))

      // Validate parsed values
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

      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          amount: amount,
          period: "monthly",
          startDate: new Date().toISOString(),
          categories: categories,
        }),
      })

      if (!response.ok) throw new Error("Failed to create budget")

      toast({
        title: "Success",
        description: "Budget created successfully",
      })

      setIsOpen(false)
      form.reset()
      if (onBudgetCreated) onBudgetCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Create a new budget with categories and spending limits.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              {form.watch("categories").map((_, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`categories.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Category name (e.g., Food)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
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
                    {form.watch("categories").length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const categories = form.getValues("categories")
                          form.setValue("categories", categories.filter((_, i) => i !== index))
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
                onClick={() =>
                  form.setValue("categories", [
                    ...form.getValues("categories"),
                    { name: "", amount: "" },
                  ])
                }
                className="w-full"
              >
                + Add Another Category
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 