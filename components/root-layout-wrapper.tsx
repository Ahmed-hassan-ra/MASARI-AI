"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { AIAssistant } from "@/components/ai/assistant"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { SiteHeader } from "@/components/layout/site-header"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { useDevice } from "@/hooks/use-device"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface RootLayoutWrapperProps {
  children: React.ReactNode
  session: any
}

export function RootLayoutWrapper({ children, session }: RootLayoutWrapperProps) {
  const device = useDevice()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  const isPublicPage = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/about")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Public pages (landing, auth): no app shell — page manages its own layout
  if (isPublicPage) {
    return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    )
  }

  // App pages: full shell with shared header
  if (!mounted) {
    return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="relative flex min-h-screen w-full flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {device.isMobile ? (
          <MobileLayout>
            {children}
          </MobileLayout>
        ) : (
          <div className="relative flex min-h-screen w-full flex-col bg-background">
            <SiteHeader />
            <div className="ml-auto flex items-center gap-2 fixed top-3 right-4 z-50">
              <NotificationBell />
            </div>
            <main className="flex-1">
              {children}
            </main>
            <div className="fixed bottom-4 right-4 z-50">
              <AIAssistant />
            </div>
          </div>
        )}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
