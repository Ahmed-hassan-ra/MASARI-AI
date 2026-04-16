"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Target, TrendingDown, TrendingUp, Zap, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface BudgetRecommendation {
  category: string
  currentSpending: number
  recommendedBudget: number
  potentialSavings: number
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface BudgetOptimizerProps {
  period?: string
  refreshKey?: number
}

export function BudgetOptimizer({ period = "month", refreshKey }: BudgetOptimizerProps) {
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalSavings, setTotalSavings] = useState(0)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/ai/budget-optimizer?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch budget recommendations')
        }
        
        const data = await response.json()
        setRecommendations(data.recommendations || [])
        setTotalSavings(data.totalPotentialSavings || 0)
      } catch (err) {
        console.error('Error fetching budget recommendations:', err)
        setError('Failed to load budget optimizer')
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [period, refreshKey])

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSavingsPercentage = (current: number, recommended: number) => {
    if (current === 0) return 0
    return ((current - recommended) / current) * 100
  }

  const handleApplyBudget = (recommendation: BudgetRecommendation) => {
    toast.success("Budget Applied!", {
      description: `Set ${recommendation.category} budget to $${recommendation.recommendedBudget.toFixed(2)}`,
    })
  }

  const handleApplyAllBudgets = () => {
    toast.success("All Budgets Applied!", {
      description: `Applied optimized budgets for ${recommendations.length} categories`,
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Budget Optimizer
          </CardTitle>
          <CardDescription>Analyzing your spending patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Optimizing your budget...</span>
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
            <Target className="h-5 w-5" />
            AI Budget Optimizer
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

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Budget Optimizer
          </CardTitle>
          <CardDescription>Smart budget recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No budget optimizations available</p>
            <p className="text-sm">Add more expenses to get personalized budget recommendations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Budget Optimizer
        </CardTitle>
        <CardDescription>
          Smart budget recommendations based on your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Card */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Optimization Summary</h3>
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="h-5 w-5" />
              <span className="font-bold text-xl">${totalSavings.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Potential monthly savings with optimized budgets
          </p>
          <Button onClick={handleApplyAllBudgets} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Apply All Optimized Budgets
          </Button>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const savingsPercentage = getSavingsPercentage(rec.currentSpending, rec.recommendedBudget)
            const isIncrease = rec.recommendedBudget > rec.currentSpending
            
            return (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{rec.category}</h4>
                    <p className="text-sm text-gray-600">{rec.reasoning}</p>
                  </div>
                  <Badge className={getConfidenceColor(rec.confidence)}>
                    {rec.confidence.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Spending</p>
                    <p className="text-xl font-bold">${rec.currentSpending.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recommended Budget</p>
                    <p className="text-xl font-bold text-blue-600">
                      ${rec.recommendedBudget.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Budget Utilization</span>
                    <span className="text-sm font-medium">
                      {((rec.currentSpending / rec.recommendedBudget) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(rec.currentSpending / rec.recommendedBudget) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      isIncrease ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isIncrease ? '+' : '-'}${Math.abs(rec.potentialSavings).toFixed(2)} 
                      ({Math.abs(savingsPercentage).toFixed(1)}%)
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplyBudget(rec)}
                  >
                    Apply Budget
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">💡 Budget Optimization Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Review and adjust budgets monthly based on your actual spending</li>
            <li>• Set up alerts when you're approaching budget limits</li>
            <li>• Focus on high-impact categories first for maximum savings</li>
            <li>• Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 