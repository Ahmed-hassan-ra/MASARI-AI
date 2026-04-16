"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIInsights } from "@/components/ai-insights"
import { BudgetOptimizer } from "@/components/budget-optimizer"
import { AIAssistant } from "@/components/ai/assistant"
import { Brain, Target, TrendingUp, Sparkles, MessageSquare } from "lucide-react"

export default function AIAssistantPage() {
  const [period, setPeriod] = useState("month")
  const [refreshKey, setRefreshKey] = useState(0)
  const [insightCount, setInsightCount] = useState<number | null>(null)
  const [potentialSavings, setPotentialSavings] = useState<number | null>(null)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setInsightCount(null)
    setPotentialSavings(null)
  }

  useEffect(() => {
    fetch(`/api/ai/insights?period=${period}`)
      .then(r => r.json())
      .then(data => setInsightCount(data?.insights?.length ?? 0))
      .catch(() => setInsightCount(0))

    fetch(`/api/ai/budget-optimizer?period=${period}`)
      .then(r => r.json())
      .then(data => setPotentialSavings(data?.totalPotentialSavings ?? 0))
      .catch(() => setPotentialSavings(0))
  }, [period, refreshKey])

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Financial Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalized insights and smart recommendations powered by artificial intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Refresh AI
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-5 w-5" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI analyzes your spending patterns to provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {insightCount === null ? "—" : insightCount}
            </div>
            <p className="text-sm text-primary/80">Active insights</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              Budget Optimization
            </CardTitle>
            <CardDescription>
              Automatically suggests budget adjustments based on your habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {potentialSavings === null ? "—" : `$${potentialSavings.toFixed(0)}`}
            </div>
            <p className="text-sm text-primary/80">Potential savings</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              AI Chat
            </CardTitle>
            <CardDescription>
              Ask your assistant anything about your finances and get instant answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Live</div>
            <p className="text-sm text-primary/80">Powered by Groq</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget Optimizer
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <AIInsights period={period} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-6">
          <BudgetOptimizer period={period} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Financial Chat
              </CardTitle>
              <CardDescription>
                Ask anything about your finances — your assistant knows your real data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AIAssistant inline />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
