"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  Home, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  BarChart3, 
  Receipt,
  User,
  Settings,
  Bell
} from "lucide-react"
import { UserNav } from "./user-nav"
import { NotificationBell } from "../notifications/notification-bell"
import { ModeToggle } from "../mode-toggle"
import { AIAssistant } from "@/components/ai/assistant"

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/budgets", icon: PiggyBank, label: "Budget" },
    { href: "/expenses", icon: CreditCard, label: "Expense" },
    { href: "/income", icon: TrendingUp, label: "Income" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
  ]

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MA$ARI</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        <div className="w-full max-w-full px-4 py-4">
          {children}
        </div>
      </main>

      {/* AI Assistant - Mobile positioned */}
      <div className="mobile-ai-assistant">
        <AIAssistant />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
        <div className="flex items-center justify-around py-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-colors flex-1 min-w-0",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
              </Link>
            )
          })}

          {/* Receipt */}
          <Link
            href="/receipts"
            className={cn(
              "flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-colors flex-1 min-w-0",
              pathname === "/receipts"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Receipt className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium truncate w-full text-center">Receipt</span>
          </Link>
        </div>
      </nav>
    </div>
  )
} 