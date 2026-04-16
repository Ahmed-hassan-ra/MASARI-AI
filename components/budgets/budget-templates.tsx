"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  categories: z.array(
    z.object({
      name: z.string().min(1, "Category name is required"),
      amount: z.number().min(0, "Amount must be positive"),
    })
  ).min(1, "At least one category is required"),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

interface BudgetTemplate {
  id: string
  name: string
  categories: {
    id: string
    name: string
    amount: number
  }[]
}

interface BudgetTemplatesProps {
  onBudgetCreated?: () => void
}

export function BudgetTemplates(props: BudgetTemplatesProps = {}) {
  const { onBudgetCreated } = props
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BudgetTemplate | null>(null)
  const { toast } = useToast()

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      categories: [{ name: "", amount: 0 }],
    },
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (editingTemplate) {
      form.reset({
        name: editingTemplate.name,
        categories: editingTemplate.categories.map((c) => ({
          name: c.name,
          amount: c.amount,
        })),
      })
    }
  }, [editingTemplate, form])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/budgets/templates")
      if (!response.ok) throw new Error("Failed to fetch templates")
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch budget templates",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: TemplateFormValues) => {
    setIsLoading(true)
    try {
      const url = editingTemplate
        ? `/api/budgets/templates?id=${editingTemplate.id}`
        : "/api/budgets/templates"
      const method = editingTemplate ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save template")

      toast({
        title: "Success",
        description: `Template ${editingTemplate ? "updated" : "created"} successfully`,
      })

      setIsDialogOpen(false)
      setEditingTemplate(null)
      form.reset()
      fetchTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/budgets/templates?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete template")

      toast({
        title: "Success",
        description: "Template deleted successfully",
      })

      fetchTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const handleUseTemplate = async (template: BudgetTemplate) => {
    try {
      // Calculate total amount from categories
      const totalAmount = template.categories.reduce((sum, cat) => sum + cat.amount, 0)
      
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          amount: totalAmount,
          categories: template.categories,
          period: "monthly",
          startDate: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to create budget from template")

      toast({
        title: "Success",
        description: "Budget created from template successfully",
      })
      
      // Notify parent component to refresh
      if (onBudgetCreated) {
        onBudgetCreated()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget from template",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Templates</CardTitle>
        <CardDescription>Create and manage budget templates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{template.name}</p>
                <p className="text-sm text-muted-foreground">
                  {template.categories.length} categories
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button size="sm" onClick={() => handleUseTemplate(template)}>
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate
                  ? "Update your budget template details."
                  : "Create a new budget template with categories."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <Label>Categories</Label>
                  {form.watch("categories").map((_, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
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
                      <FormField
                        control={form.control}
                        name={`categories.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Amount"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      form.setValue("categories", [
                        ...form.getValues("categories"),
                        { name: "", amount: 0 },
                      ])
                    }
                  >
                    Add Category
                  </Button>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? "Saving..."
                      : editingTemplate
                      ? "Update Template"
                      : "Create Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
} 