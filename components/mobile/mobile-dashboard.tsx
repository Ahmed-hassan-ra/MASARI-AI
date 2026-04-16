"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, TrendingUp, TrendingDown, PiggyBank, Settings } from "lucide-react"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import Link from "next/link"

interface DashboardData {
  balance: number
  income: number
  expenses: number
  savingsRate: number
  incomeChange: number
  expensesChange: number
}

export function MobileDashboard() {
  const [data, setData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
    incomeChange: 0,
    expensesChange: 0
  })

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/summary')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-3">
        <div className="flex-1">
          <AddTransactionDialog onTransactionAdded={fetchDashboardData} />
        </div>
        <Link href="/simple-settings">
          <Button variant="outline" size="lg" className="h-12 px-4">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Balance Card - Prominent Display */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-1">Total Balance</p>
            <h2 className="text-3xl font-bold mb-2">${data.balance.toFixed(2)}</h2>
            <p className="text-xs opacity-75">+0.0% from last month</p>
          </div>
        </CardContent>
      </Card>

      {/* Income & Expenses Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                +{data.incomeChange.toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="text-xl font-bold">${data.income.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-xs text-red-600 font-medium">
                +{data.expensesChange.toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-xl font-bold">${data.expenses.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PiggyBank className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Savings Rate</p>
                <p className="text-xs text-muted-foreground">Based on current month data</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{data.savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Quick Overview</h3>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Net Income</span>
              <span className="font-medium">${(data.income - data.expenses).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Spending vs Income</span>
              <span className="font-medium">{data.income > 0 ? ((data.expenses / data.income) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Days Remaining</span>
              <span className="font-medium">{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 