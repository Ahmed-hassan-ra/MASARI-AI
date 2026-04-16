"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"

export function ThemeSync() {
  const { data: session } = useSession()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (!session?.user) return
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        if (profile?.theme) setTheme(profile.theme)
      })
      .catch(() => {})
  }, [session?.user])

  return null
}
