"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Wallet } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/income", label: "Income" },
  { href: "/expenses", label: "Expenses" },
  { href: "/budgets", label: "Budgets" },
  { href: "/reports", label: "Reports" },
  { href: "/receipts", label: "Receipts" },
  { href: "/ai-assistant", label: "AI" },
]

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className={cn("flex items-center gap-1 w-full", className)} {...props}>
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-bold text-sm mr-4 flex-shrink-0"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Wallet className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="hidden sm:inline">
          MA<span className="text-primary">$</span>ARI-AI
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = mounted
            ? pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            : false
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs md:text-sm font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex-shrink-0",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
