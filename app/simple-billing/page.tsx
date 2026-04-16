"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Calendar, Download, ArrowLeft } from "lucide-react"

export default function SimpleBillingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Wallet className="h-5 w-5 md:h-6 md:w-6" />
          <span className="text-sm md:text-base">MA$ARI-AI</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-3 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">Billing & Subscription</h1>
        </div>

        <div className="grid gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Plan
                <Badge variant="secondary">Free</Badge>
              </CardTitle>
              <CardDescription>
                You're currently on the free plan with basic features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span>Plan:</span>
                  <span className="font-medium">Free Plan</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span className="font-medium">$0.00/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Features:</span>
                  <span className="font-medium">Basic tracking, 3 budgets</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next billing:</span>
                  <span className="font-medium">N/A</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1">Upgrade to Pro</Button>
                <Button variant="outline" className="flex-1">View All Plans</Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No payment methods added</p>
                <p className="text-sm">Add a payment method to upgrade your plan</p>
              </div>
              <Button className="w-full">Add Payment Method</Button>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No billing history</p>
                <p className="text-sm">Your invoices will appear here once you upgrade</p>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
              <CardDescription>
                Track your current usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budgets Created</span>
                    <span>2 / 3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Transactions This Month</span>
                    <span>45 / 100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI Insights</span>
                    <span>8 / 10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Free</h3>
                  <p className="text-2xl font-bold">$0<span className="text-sm font-normal">/month</span></p>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• 3 budgets</li>
                    <li>• 100 transactions/month</li>
                    <li>• Basic reports</li>
                    <li>• 10 AI insights/month</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" disabled>Current Plan</Button>
                </div>

                <div className="border rounded-lg p-4 border-blue-500 relative">
                  <Badge className="absolute -top-2 left-4">Popular</Badge>
                  <h3 className="font-semibold">Pro</h3>
                  <p className="text-2xl font-bold">$9.99<span className="text-sm font-normal">/month</span></p>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• Unlimited budgets</li>
                    <li>• Unlimited transactions</li>
                    <li>• Advanced reports</li>
                    <li>• Unlimited AI insights</li>
                    <li>• Export data</li>
                    <li>• Priority support</li>
                  </ul>
                  <Button className="w-full mt-4">Upgrade to Pro</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Enterprise</h3>
                  <p className="text-2xl font-bold">$29.99<span className="text-sm font-normal">/month</span></p>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• Everything in Pro</li>
                    <li>• Multi-user access</li>
                    <li>• Custom integrations</li>
                    <li>• Advanced analytics</li>
                    <li>• Dedicated support</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">Contact Sales</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 