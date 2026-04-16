"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIInsights } from "@/components/ai-insights"
import { BudgetOptimizer } from "@/components/budget-optimizer"
import { Brain, Target, TrendingUp, Sparkles, Zap, MessageSquare } from "lucide-react"

export default function AIAssistantPage() {
  const [period, setPeriod] = useState("month")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
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

      {/* AI Features Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="h-5 w-5" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI analyzes your spending patterns to provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-sm text-blue-600">Active insights</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Target className="h-5 w-5" />
              Budget Optimization
            </CardTitle>
            <CardDescription>
              Automatically suggests budget adjustments based on your habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$247</div>
            <p className="text-sm text-green-600">Potential savings</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              Predictive Analytics
            </CardTitle>
            <CardDescription>
              Forecasts future spending and identifies potential issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <p className="text-sm text-purple-600">Accuracy rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Features */}
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
            AI Chat (Coming Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <AIInsights period={period} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-6">
          <BudgetOptimizer period={period} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Financial Chat Assistant
              </CardTitle>
              <CardDescription>
                Coming soon: Chat with your AI financial advisor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Chat Assistant</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Soon you'll be able to ask questions like "How much did I spend on groceries last month?" 
                  or "Should I increase my entertainment budget?" and get instant, personalized answers.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>🤖 Natural language queries</p>
                  <p>💡 Smart financial advice</p>
                  <p>📊 Instant data analysis</p>
                  <p>🎯 Goal-oriented recommendations</p>
                </div>
                <Button className="mt-6" disabled>
                  <Zap className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Features Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Features Roadmap
          </CardTitle>
          <CardDescription>
            Upcoming AI-powered features to enhance your financial management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🤖 Smart Categorization</h4>
              <p className="text-sm text-muted-foreground">
                Automatically categorize transactions with 95% accuracy using machine learning
              </p>
              <div className="mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Coming Next</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📸 Receipt Scanning</h4>
              <p className="text-sm text-muted-foreground">
                Extract expense data from receipt photos using AI vision technology
              </p>
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">In Development</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Goal Tracking</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered goal setting and progress tracking with smart milestones
              </p>
              <div className="mt-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Planned</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📈 Investment Advice</h4>
              <p className="text-sm text-muted-foreground">
                Personalized investment recommendations based on your financial profile
              </p>
              <div className="mt-2">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Research</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔮 Predictive Alerts</h4>
              <p className="text-sm text-muted-foreground">
                Get notified before you overspend or miss important financial deadlines
              </p>
              <div className="mt-2">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Concept</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🗣️ Voice Commands</h4>
              <p className="text-sm text-muted-foreground">
                Add expenses and get insights using natural voice commands
              </p>
              <div className="mt-2">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Future</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 