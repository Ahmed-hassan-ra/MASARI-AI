"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Edit, Trash2, Loader2, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useCurrency } from "@/lib/currency-context"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

interface ExpenseListProps {
  filter?: "today" | "week" | "month"
  refreshKey?: number
  selectedMonth?: number
  selectedYear?: number
  onChanged?: () => void
}

export function ExpenseList({ filter, refreshKey, selectedMonth, selectedYear, onChanged }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editForm, setEditForm] = useState({ description: "", amount: "", category: "", date: "" })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    fetchExpenses()
  }, [refreshKey, filter, selectedMonth, selectedYear])

  async function fetchExpenses() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedMonth !== undefined && selectedYear !== undefined) {
        const start = new Date(selectedYear, selectedMonth, 1)
        const end = new Date(selectedYear, selectedMonth + 1, 0)
        params.append("startDate", start.toISOString().split("T")[0])
        params.append("endDate", end.toISOString().split("T")[0])
      } else if (filter) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        let start: Date, end = new Date()
        switch (filter) {
          case "today":
            start = today; end = today; break
          case "week":
            start = new Date(today); start.setDate(today.getDate() - today.getDay())
            end = new Date(start); end.setDate(start.getDate() + 6); break
          case "month":
            start = new Date(now.getFullYear(), now.getMonth(), 1)
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0); break
          default:
            start = new Date(0)
        }
        params.append("startDate", start!.toISOString().split("T")[0])
        params.append("endDate", end.toISOString().split("T")[0])
      }
      const res = await fetch(`/api/expenses${params.toString() ? "?" + params : ""}`)
      setExpenses(await res.json() || [])
    } catch {
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setExpenses(prev => prev.filter(e => e.id !== id))
      onChanged?.()
      toast({ title: "Expense deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split("T")[0],
    })
  }

  const handleSaveEdit = async () => {
    if (!editingExpense) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editForm.description,
          amount: parseFloat(editForm.amount),
          category: editForm.category,
          date: editForm.date,
        }),
      })
      if (!res.ok) throw new Error()
      setEditingExpense(null)
      onChanged?.()
      fetchExpenses()
      toast({ title: "Expense updated" })
    } catch {
      toast({ title: "Error", description: "Failed to update expense", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-muted-foreground" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <p className="text-muted-foreground text-sm">No expenses found for this period.</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/expenses">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>
    )
  }

  const categories = ["food","transportation","housing","utilities","healthcare","entertainment","shopping","education","other"]

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.description}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-medium text-red-500">
                -{formatCurrency(expense.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(expense)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={deletingId === expense.id}>
                        {deletingId === expense.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete <strong>{expense.description}</strong> ({formatCurrency(expense.amount)})? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(expense.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editingExpense} onOpenChange={(o) => !o && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={v => setEditForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
