"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface CurrencyContextValue {
  currency: string
  formatCurrency: (amount: number) => string
  formatCompact: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  formatCurrency: (amount) => `$${amount.toFixed(2)}`,
  formatCompact: (amount) => `$${amount.toFixed(0)}`,
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    if (!session?.user) return
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        if (profile?.currency) setCurrency(profile.currency)
      })
      .catch(() => {})
  }, [session?.user])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)

  const formatCompact = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(amount)

  return (
    <CurrencyContext.Provider value={{ currency, formatCurrency, formatCompact }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
