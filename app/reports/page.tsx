"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Download, Loader2 } from "lucide-react"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { ExpenseTrendChart } from "@/components/expense-trend-chart"
import { SavingsGoalChart } from "@/components/savings-goal-chart"
import { CategoryComparisonChart } from "@/components/category-comparison-chart"
import { ExportReport } from "@/components/reports/export-report"
import { MonthSelector } from "@/components/month-selector"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  summary: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    savingsRate: number
    changes: {
      income: number
      expenses: number
      savings: number
    }
  }
  categoryBreakdown: {
    income: Array<{ category: string; amount: number; percentage: number }>
    expenses: Array<{ category: string; amount: number; percentage: number }>
  }
  monthlyData: Array<{
    name: string
    income: number
    expenses: number
    savings: number
  }>
  period: string
  dateRange: {
    start: string
    end: string
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Month selector state
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [useCustomMonth, setUseCustomMonth] = useState(false)
  
  const { toast } = useToast()

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    setUseCustomMonth(true)
    setSelectedPeriod("custom")
  }

  const handlePeriodChange = (period: string) => {
    if (period !== "custom") {
      setUseCustomMonth(false)
    }
    setSelectedPeriod(period)
  }

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true)
      try {
        let url = `/api/reports/data?period=${selectedPeriod}`
        
        // If using custom month, add specific date range
        if (useCustomMonth && selectedPeriod === "custom") {
          const startDate = new Date(selectedYear, selectedMonth, 1).toISOString()
          const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString()
          url = `/api/reports/data?startDate=${startDate}&endDate=${endDate}`
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch report data')
        }
        const data = await response.json()
        setReportData(data)
      } catch (error) {
        console.error('Error fetching report data:', error)
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [selectedPeriod, refreshKey, useCustomMonth, selectedMonth, selectedYear, toast])

  const handleExportQuick = async () => {
    if (!reportData) return

    try {
      const params = new URLSearchParams({
        startDate: reportData.dateRange.start,
        endDate: reportData.dateRange.end,
        format: "csv",
      })

      const response = await fetch(`/api/reports/export?${params}`)
      if (!response.ok) {
        throw new Error("Failed to export report")
      }

      const csvContent = await response.text()
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `financial-report-${selectedPeriod}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Report exported successfully",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

  const getReportTitle = () => {
    if (useCustomMonth && selectedPeriod === "custom") {
      return `Financial Reports - ${monthNames[selectedMonth]} ${selectedYear}`
    }
    switch (selectedPeriod) {
      case "month": return "Financial Reports - This Month"
      case "quarter": return "Financial Reports - This Quarter"
      case "year": return "Financial Reports - This Year"
      default: return "Financial Reports"
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">Financial Reports</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Month</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedPeriod === "custom" && (
                <MonthSelector
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthYearChange={handleMonthYearChange}
                  className="w-full sm:w-auto"
                />
              )}
              
              <Button variant="outline" onClick={handleExportQuick} disabled={!reportData} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                <span className="sm:inline">Export</span>
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {getReportTitle()}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading report data...</span>
            </div>
          ) : !reportData ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Failed to load report data</p>
              <Button onClick={() => setRefreshKey(k => k + 1)} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : (
            <>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-full grid-cols-2 sm:max-w-md sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
              <TabsTrigger value="income" className="text-xs sm:text-sm">Income</TabsTrigger>
              <TabsTrigger value="savings" className="text-xs sm:text-sm">Savings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{formatCurrency(reportData.summary.totalIncome)}</div>
                        <p className={`text-xs ${getChangeColor(reportData.summary.changes.income)}`}>
                          {formatPercentage(reportData.summary.changes.income)} from last {selectedPeriod}
                        </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{formatCurrency(reportData.summary.totalExpenses)}</div>
                        <p className={`text-xs ${getChangeColor(reportData.summary.changes.expenses)}`}>
                          {formatPercentage(reportData.summary.changes.expenses)} from last {selectedPeriod}
                        </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{formatCurrency(reportData.summary.netSavings)}</div>
                        <p className={`text-xs ${getChangeColor(reportData.summary.changes.savings)}`}>
                          {formatPercentage(reportData.summary.changes.savings)} from last {selectedPeriod}
                        </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{reportData.summary.savingsRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          {reportData.summary.totalIncome > 0 ? 'Healthy savings rate' : 'No income recorded'}
                        </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Cash Flow</CardTitle>
                    <CardDescription>Income vs. expenses over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[300px]">
                        <CashFlowChart period={selectedPeriod} refreshKey={refreshKey} />
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Expense Trends</CardTitle>
                    <CardDescription>Monthly expense trends by category.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[300px]">
                        <ExpenseTrendChart period={selectedPeriod} refreshKey={refreshKey} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="expenses" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of your expenses.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                      <CategoryComparisonChart type="expenses" period={selectedPeriod} refreshKey={refreshKey} />
                </CardContent>
              </Card>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Spending Categories</CardTitle>
                    <CardDescription>Where most of your money goes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                          {reportData.categoryBreakdown.expenses.length > 0 ? (
                            reportData.categoryBreakdown.expenses
                              .sort((a, b) => b.amount - a.amount)
                              .slice(0, 5)
                              .map((item) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-sm font-medium leading-none truncate">
                                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.amount)}</p>
                                  </div>
                                  <div className="text-sm font-medium ml-2">{item.percentage.toFixed(1)}%</div>
                          </div>
                              ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No expense data available</p>
                          )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                        <CardTitle>Expense Summary</CardTitle>
                        <CardDescription>Total expenses for this {selectedPeriod}.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold">{formatCurrency(reportData.summary.totalExpenses)}</div>
                            <p className="text-sm text-muted-foreground">Total Expenses</p>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getChangeColor(reportData.summary.changes.expenses)}`}>
                              {formatPercentage(reportData.summary.changes.expenses)}
                            </div>
                            <p className="text-sm text-muted-foreground">vs. last {selectedPeriod}</p>
                          </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="income" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Income Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of your income sources.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                      <CategoryComparisonChart type="income" period={selectedPeriod} refreshKey={refreshKey} />
                </CardContent>
              </Card>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Income Sources</CardTitle>
                    <CardDescription>Where your money comes from.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                          {reportData.categoryBreakdown.income.length > 0 ? (
                            reportData.categoryBreakdown.income
                              .sort((a, b) => b.amount - a.amount)
                              .map((item) => (
                                <div key={item.category} className="flex items-center justify-between">
                          <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-sm font-medium leading-none truncate">
                                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.amount)}</p>
                                  </div>
                                  <div className="text-sm font-medium ml-2">{item.percentage.toFixed(1)}%</div>
                          </div>
                              ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No income data available</p>
                          )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Income Trends</CardTitle>
                    <CardDescription>Your income over the past 6 months.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[200px]">
                        <ExpenseTrendChart type="income" period={selectedPeriod} refreshKey={refreshKey} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="savings" className="space-y-4 mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Savings Goal</CardTitle>
                    <CardDescription>Track your progress towards savings goals.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[300px]">
                        <SavingsGoalChart period={selectedPeriod} refreshKey={refreshKey} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Savings Rate</CardTitle>
                    <CardDescription>Your savings as a percentage of income.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[300px]">
                        <ExpenseTrendChart type="savings" period={selectedPeriod} refreshKey={refreshKey} />
                  </CardContent>
                </Card>
                  </div>
            </TabsContent>
          </Tabs>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Export Financial Report</CardTitle>
                <CardDescription>Export your financial data for a specific date range</CardDescription>
              </CardHeader>
              <CardContent>
                <ExportReport />
              </CardContent>
            </Card>
          </div>
            </>
          )}
    </main>
  )
}
