"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { BudgetProgress } from "@/components/budget-progress"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { AIInsights } from "@/components/ai-insights"
import { BudgetOptimizer } from "@/components/budget-optimizer"
import { DollarSign, CreditCard, Wallet, BarChart3, Receipt } from "lucide-react"
import { useDevice } from "@/hooks/use-device"
import { MobileDashboard } from "@/components/mobile/mobile-dashboard"
import Link from "next/link"

interface DashboardData {
  balance: number
  income: number
  expenses: number
  savingsRate: number
  incomeChange: number
  expensesChange: number
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
    incomeChange: 0,
    expensesChange: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshTransactions, setRefreshTransactions] = useState(0)
  const device = useDevice()

  const handleTransactionAdded = () => {
    setRefreshTransactions((prev) => prev + 1)
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/summary")
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [refreshTransactions])

  if (device.isMobile) {
    return <MobileDashboard />
  }

  const getCardCols = () => {
    if (device.isTablet) return "grid-cols-2"
    return "grid-cols-4"
  }

  const getMainCols = () => {
    if (device.isTablet) return "grid-cols-1"
    return "grid-cols-7"
  }

  const getContentSpacing = () => {
    if (device.isTablet) return "gap-4 p-4"
    return "gap-6 p-6"
  }

  return (
    <main className={`flex flex-col ${getContentSpacing()}`}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
      </div>

      {/* Stats cards */}
      <div className={`grid gap-4 ${getCardCols()}`}>
        {[
          { title: "Total Balance", value: dashboardData.balance, change: dashboardData.incomeChange, icon: DollarSign },
          { title: "Monthly Income", value: dashboardData.income, change: dashboardData.incomeChange, icon: Wallet },
          { title: "Monthly Expenses", value: dashboardData.expenses, change: dashboardData.expensesChange, icon: CreditCard },
          { title: "Savings Rate", value: dashboardData.savingsRate, change: null, icon: BarChart3, isPercentage: true },
        ].map((card, index) => (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "—"
                  : card.isPercentage
                  ? `${card.value.toFixed(1)}%`
                  : `$${card.value.toFixed(2)}`}
              </div>
              {card.change !== null && !loading && (
                <p className="text-xs text-muted-foreground mt-1">
                  {card.change >= 0 ? "+" : ""}
                  {card.change.toFixed(1)}% from last month
                </p>
              )}
              {card.isPercentage && !loading && (
                <p className="text-xs text-muted-foreground mt-1">Based on current month data</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview + Recent Transactions */}
      <div className={`grid gap-4 ${getMainCols()}`}>
        <Card className={device.isDesktop ? "col-span-4" : "col-span-1"}>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your income and expenses over time.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className={device.isDesktop ? "col-span-3" : "col-span-1"}>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions refreshKey={refreshTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress + Quick Actions */}
      <div className={`grid gap-4 ${getMainCols()}`}>
        <Card className={device.isDesktop ? "col-span-4" : "col-span-1"}>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>Track your spending against budget limits.</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetProgress />
          </CardContent>
        </Card>
        <Card className={device.isDesktop ? "col-span-3" : "col-span-1"}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {[
                { href: "/income", icon: DollarSign, label: "Add Income" },
                { href: "/expenses", icon: CreditCard, label: "Add Expense" },
                { href: "/receipts", icon: Receipt, label: "Scan Receipt" },
              ].map((action) => (
                <Button key={action.href} variant="outline" className="justify-start h-10" asChild>
                  <Link href={action.href}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Features */}
      <div className={`grid gap-4 ${device.isTablet ? "grid-cols-1" : "grid-cols-2"}`}>
        <AIInsights period="month" refreshKey={refreshTransactions} />
        <BudgetOptimizer period="month" refreshKey={refreshTransactions} />
      </div>
    </main>
  )
}
