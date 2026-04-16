"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { AIAssistant } from "@/components/ai/assistant"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { SiteHeader } from "@/components/layout/site-header"

interface ClientWrapperProps {
  children: React.ReactNode
  session: any
}

export function ClientWrapper({ children, session }: ClientWrapperProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center px-4 md:px-6">
              <SiteHeader />
              <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <div className="fixed bottom-4 right-4 z-50">
            <AIAssistant />
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
} 