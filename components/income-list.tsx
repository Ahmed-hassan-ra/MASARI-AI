"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface IncomeListProps {
  filter?: "month" | "quarter" | "year"
  refreshKey?: number
  selectedMonth?: number
  selectedYear?: number
}

interface Income {
  id: string
  description: string
  amount: number
  category: string
  date: string
  createdAt: string
}

export function IncomeList({ filter, refreshKey }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchIncomes() {
      setLoading(true)
      try {
        let url = "/api/income"
        const params = new URLSearchParams()

        // Add date filtering based on filter prop
        if (filter) {
          const now = new Date()
          let startDate: Date
          let endDate = new Date()

          switch (filter) {
            case "month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1)
              endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
              break
            case "quarter":
              const quarter = Math.floor(now.getMonth() / 3)
              startDate = new Date(now.getFullYear(), quarter * 3, 1)
              endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0)
              break
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1)
              endDate = new Date(now.getFullYear(), 11, 31)
              break
            default:
              startDate = new Date(0) // Beginning of time
          }

          if (startDate) {
            params.append("startDate", startDate.toISOString())
            params.append("endDate", endDate.toISOString())
          }
        }

        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const res = await fetch(url)
        if (!res.ok) {
          throw new Error("Failed to fetch income data")
        }
        const data = await res.json()
        setIncomes(data || [])
      } catch (err) {
        console.error("Error fetching incomes:", err)
        toast({
          title: "Error",
          description: "Failed to load income data",
          variant: "destructive",
        })
        setIncomes([])
      } finally {
        setLoading(false)
      }
    }
    fetchIncomes()
  }, [refreshKey, filter, toast])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/income/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete income")
      }

      setIncomes(incomes.filter(income => income.id !== id))
      toast({
        title: "Success",
        description: "Income deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting income:", err)
      toast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      salary: "bg-green-100 text-green-800",
      freelance: "bg-blue-100 text-blue-800",
      investments: "bg-purple-100 text-purple-800",
      gifts: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category.toLowerCase()] || colors.other
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading income data...</span>
      </div>
    )
  }

  if (!incomes.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No income records found.</p>
        {filter && <p className="text-sm">Try selecting a different time period.</p>}
      </div>
    )
  }

  return (
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
              <Badge 
                variant="outline" 
                className={getCategoryColor(income.category)}
              >
                {income.category.charAt(0).toUpperCase() + income.category.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
            <TableCell className="text-right font-medium">
              ${income.amount.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" title="Edit income">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Delete income"
                      disabled={deletingId === income.id}
                    >
                      {deletingId === income.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Income</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this income record? This action cannot be undone.
                        <br />
                        <br />
                        <strong>{income.description}</strong> - ${income.amount.toFixed(2)}
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
  )
}
