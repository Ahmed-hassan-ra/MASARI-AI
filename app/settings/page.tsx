"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Wallet, BarChart3, CreditCard, Receipt } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

const settingsFormSchema = z.object({
  currency: z.string().min(1, { message: "Please select a currency" }),
  language: z.string().min(1, { message: "Please select a language" }),
  theme: z.string().min(1, { message: "Please select a theme" }),
  dateFormat: z.string().min(1, { message: "Please select a date format" }),
  notifications: z.boolean(),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      currency: "USD",
      language: "en",
      theme: "light",
      dateFormat: "MM/DD/YYYY",
      notifications: true,
    },
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoadingProfile(true)
        const res = await fetch("/api/user/profile", {
          credentials: 'include', // Include cookies for authentication
        })
        
        if (res.status === 401 || res.status === 404) {
          // User is not authenticated or not found in database, redirect to login
          router.push('/auth/login')
          return
        }
        
        if (res.ok) {
          const profile = await res.json()
          form.reset({
            currency: profile.currency || "USD",
            language: profile.language || "en",
            theme: profile.theme || "light",
            dateFormat: profile.dateFormat || "MM/DD/YYYY",
            notifications: profile.notifications ?? true,
          })
        } else {
          console.error("Failed to fetch profile:", res.status, res.statusText)
          // Don't show error toast for authentication issues
          if (res.status !== 401 && res.status !== 404) {
            toast({
              title: "Warning",
              description: "Could not load your current settings. Using defaults.",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        // Only show error toast if it's not a network/auth issue
        if (error instanceof Error && !error.message.includes('fetch')) {
        toast({
          title: "Error",
            description: "Failed to load profile settings. Using defaults.",
          variant: "destructive",
        })
        }
      } finally {
        setIsLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [form, toast, router])

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(data),
      })

      if (response.status === 401 || response.status === 404) {
        // User is not authenticated or not found in database, redirect to login
        router.push('/auth/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const updatedProfile = await response.json()
      console.log("Profile updated successfully:", updatedProfile)

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      // Only show error toast if it's not a network/auth issue
      if (error instanceof Error && !error.message.includes('fetch')) {
      toast({
        title: "Error",
          description: error instanceof Error ? error.message : "Failed to update settings. Please try again.",
        variant: "destructive",
      })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Wallet className="h-6 w-6" />
          <span>MA$ARI-AI</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-48 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-1 flex-col gap-2 px-2 py-4">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard">
                <Wallet className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/budgets">
                <BarChart3 className="mr-2 h-4 w-4" />
                Budgets
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/expenses">
                <CreditCard className="mr-2 h-4 w-4" />
                Expenses
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/income">
                <DollarSign className="mr-2 h-4 w-4" />
                Income
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/receipts">
                <Receipt className="mr-2 h-4 w-4" />
                Receipts
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Connect your bank accounts for automatic transaction tracking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Bank of America</p>
                      <p className="text-sm text-muted-foreground">Connected on May 15, 2025</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Chase</p>
                      <p className="text-sm text-muted-foreground">Connected on May 10, 2025</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                  <Button className="w-full">Connect New Account</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your application preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading your settings...</span>
                    </div>
                  ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                                <SelectItem value="MYR">MYR (RM)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Your preferred currency for transactions.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                                <SelectItem value="ja">日本語</SelectItem>
                                <SelectItem value="zh">中文</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Your preferred language for the application.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                              </FormControl>
                      <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                            <FormDescription>Your preferred theme for the application.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                              </FormControl>
                      <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                            <FormDescription>Your preferred date format for the application.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                              <FormLabel className="text-base">Notifications</FormLabel>
                              <FormDescription>Receive notifications about your finances.</FormDescription>
                    </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Budget Settings</CardTitle>
                  <CardDescription>Configure your budget calculation preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="budget-period">Default Budget Period</Label>
                    <Select>
                      <SelectTrigger id="budget-period">
                        <SelectValue placeholder="Monthly" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="rollover">Budget Rollover</Label>
                      <p className="text-sm text-muted-foreground">
                        Roll over unused budget amounts to the next period.
                      </p>
                    </div>
                    <Switch id="rollover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-adjust">Auto-adjust Budgets</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically adjust budgets based on spending patterns.
                      </p>
                    </div>
                    <Switch id="auto-adjust" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Budget Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how and when you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                    </div>
                    <Switch id="email-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device.</p>
                    </div>
                    <Switch id="push-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="budget-alerts">Budget Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when you approach budget limits.</p>
                    </div>
                    <Switch id="budget-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="bill-reminders">Bill Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders for upcoming bills.</p>
                    </div>
                    <Switch id="bill-reminders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="unusual-activity">Unusual Activity</Label>
                      <p className="text-sm text-muted-foreground">Get alerts for unusual spending patterns.</p>
                    </div>
                    <Switch id="unusual-activity" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Notification Settings</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Report Delivery</CardTitle>
                  <CardDescription>Configure automated financial reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="report-frequency">Report Frequency</Label>
                    <Select>
                      <SelectTrigger id="report-frequency">
                        <SelectValue placeholder="Monthly" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="expense-summary">Expense Summary</Label>
                      <p className="text-sm text-muted-foreground">Receive periodic expense summaries.</p>
                    </div>
                    <Switch id="expense-summary" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="savings-report">Savings Report</Label>
                      <p className="text-sm text-muted-foreground">Receive reports on your savings progress.</p>
                    </div>
                    <Switch id="savings-report" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Report Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
