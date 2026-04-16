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

interface Income {
  id: string
  description: string
  amount: number
  category: string
  date: string
  createdAt: string
}

interface IncomeListProps {
  filter?: "month" | "quarter" | "year"
  refreshKey?: number
  selectedMonth?: number
  selectedYear?: number
  onChanged?: () => void
}

export function IncomeList({ filter, refreshKey, selectedMonth, selectedYear, onChanged }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [editForm, setEditForm] = useState({ description: "", amount: "", category: "", date: "" })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    fetchIncomes()
  }, [refreshKey, filter, selectedMonth, selectedYear])

  async function fetchIncomes() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedMonth !== undefined && selectedYear !== undefined) {
        const start = new Date(selectedYear, selectedMonth, 1)
        const end = new Date(selectedYear, selectedMonth + 1, 0)
        params.append("startDate", start.toISOString())
        params.append("endDate", end.toISOString())
      } else if (filter) {
        const now = new Date()
        let start: Date, end = new Date()
        switch (filter) {
          case "month":
            start = new Date(now.getFullYear(), now.getMonth(), 1)
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            break
          case "quarter":
            const q = Math.floor(now.getMonth() / 3)
            start = new Date(now.getFullYear(), q * 3, 1)
            end = new Date(now.getFullYear(), q * 3 + 3, 0)
            break
          case "year":
            start = new Date(now.getFullYear(), 0, 1)
            end = new Date(now.getFullYear(), 11, 31)
            break
          default:
            start = new Date(0)
        }
        params.append("startDate", start!.toISOString())
        params.append("endDate", end.toISOString())
      }
      const res = await fetch(`/api/income${params.toString() ? "?" + params : ""}`)
      if (!res.ok) throw new Error("Failed to fetch")
      setIncomes(await res.json() || [])
    } catch {
      setIncomes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/income/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setIncomes(prev => prev.filter(i => i.id !== id))
      onChanged?.()
      toast({ title: "Income deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete income", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (income: Income) => {
    setEditingIncome(income)
    setEditForm({
      description: income.description,
      amount: income.amount.toString(),
      category: income.category,
      date: income.date.split("T")[0],
    })
  }

  const handleSaveEdit = async () => {
    if (!editingIncome) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/income/${editingIncome.id}`, {
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
      setEditingIncome(null)
      onChanged?.()
      fetchIncomes()
      toast({ title: "Income updated" })
    } catch {
      toast({ title: "Error", description: "Failed to update income", variant: "destructive" })
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

  if (!incomes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <p className="text-muted-foreground text-sm">No income records found for this period.</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/income">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Income
          </Link>
        </Button>
      </div>
    )
  }

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
          {incomes.map((income) => (
            <TableRow key={income.id}>
              <TableCell className="font-medium">{income.description}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {income.category.charAt(0).toUpperCase() + income.category.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-medium text-green-600">
                +{formatCurrency(income.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(income)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={deletingId === income.id}>
                        {deletingId === income.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Income</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete <strong>{income.description}</strong> ({formatCurrency(income.amount)})? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(income.id)}
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

      <Dialog open={!!editingIncome} onOpenChange={(o) => !o && setEditingIncome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
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
                  {["salary","freelance","business","investment","rental","bonus","other"].map(c => (
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
            <Button variant="outline" onClick={() => setEditingIncome(null)}>Cancel</Button>
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
