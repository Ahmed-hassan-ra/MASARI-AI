"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Lightbulb, Trophy, TrendingUp, Brain, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface PersonalizedInsight {
  id: string
  type: 'warning' | 'suggestion' | 'achievement' | 'prediction'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  action?: string
  savings?: number
  category?: string
}

interface AIInsightsProps {
  period?: string
  refreshKey?: number
}

export function AIInsights({ period = "month", refreshKey }: AIInsightsProps) {
  const [insights, setInsights] = useState<PersonalizedInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/ai/insights?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch AI insights')
        }
        
        const data = await response.json()
        setInsights(data.insights || [])
      } catch (err) {
        console.error('Error fetching AI insights:', err)
        setError('Failed to load AI insights')
        setInsights([])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [period, refreshKey])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'suggestion':
        return <Lightbulb className="h-5 w-5 text-blue-500" />
      case 'achievement':
        return <Trophy className="h-5 w-5 text-green-500" />
      case 'prediction':
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      default:
        return <Brain className="h-5 w-5 text-gray-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'suggestion':
        return 'border-blue-200 bg-blue-50'
      case 'achievement':
        return 'border-green-200 bg-green-50'
      case 'prediction':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    }
    return (
      <Badge className={colors[impact as keyof typeof colors] || colors.low}>
        {impact.toUpperCase()} IMPACT
      </Badge>
    )
  }

  const handleTakeAction = (insight: PersonalizedInsight) => {
    if (insight.action) {
      toast.success("Action noted!", {
        description: `We'll help you: ${insight.action}`,
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Analyzing your financial patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Generating personalized insights...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>{error}</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Personalized financial intelligence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available yet</p>
            <p className="text-sm">Add more transactions to get personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                </div>
                {getImpactBadge(insight.impact)}
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {insight.savings && (
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Save ${insight.savings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {insight.category && (
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                  )}
                </div>
                
                {insight.actionable && insight.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTakeAction(insight)}
                    className="text-xs"
                  >
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 