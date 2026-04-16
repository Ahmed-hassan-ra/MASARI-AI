"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Save, Check, ArrowLeft, User, Mail, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  name: string
  email: string
  joinDate: string
  avatar: string
}

const defaultProfile: UserProfile = {
  name: "Demo User",
  email: "demo@masariai.com",
  joinDate: "2025-01-01",
  avatar: "",
}

export default function SimpleProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("user-profile")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfile({ ...defaultProfile, ...parsed })
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
  }, [])

  // Save profile to localStorage
  const saveProfile = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem("user-profile", JSON.stringify(profile))
      setIsSaved(true)
      toast({
        title: "Profile saved!",
        description: "Your profile information has been updated successfully.",
      })
      
      // Reset saved indicator after 2 seconds
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = (key: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }))
    setIsSaved(false)
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">User Profile</h1>
          <Button onClick={saveProfile} disabled={isLoading || isSaved} className="w-full sm:w-auto">
            {isLoading ? (
              "Saving..."
            ) : isSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="joinDate">Member Since</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={profile.joinDate}
                    onChange={(e) => updateProfile("joinDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>
                Your account statistics and activity summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Profile Completion</p>
                    <p className="text-sm text-muted-foreground">85% complete</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Days Active</p>
                    <p className="text-sm text-muted-foreground">15 days this month</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Transactions Tracked</p>
                    <p className="text-sm text-muted-foreground">127 total transactions</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/simple-settings">
                      <User className="mr-2 h-4 w-4" />
                      Update Settings
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/simple-billing">
                      <Mail className="mr-2 h-4 w-4" />
                      Billing Information
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Password & Authentication</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      View Login History
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Privacy Controls</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Privacy Settings
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Current profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm grid-cols-1 sm:grid-cols-3">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Member Since:</span>
                <span>{new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 