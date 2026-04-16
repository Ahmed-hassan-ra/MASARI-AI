"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const ERRORS: Record<string, string> = {
  Configuration:   "There is a problem with the server configuration.",
  AccessDenied:    "You do not have permission to sign in.",
  Verification:    "The sign-in link is no longer valid.",
  OAuthSignin:     "Could not start the Google sign-in process. Check your Google OAuth credentials.",
  OAuthCallback:   "Could not complete Google sign-in. Make sure the redirect URI is added in Google Console.",
  OAuthCreateAccount: "Could not create an account using Google.",
  EmailCreateAccount: "Could not create an account using this email.",
  Callback:        "Something went wrong during sign-in.",
  Default:         "An unexpected error occurred during sign-in.",
}

function ErrorContent() {
  const params = useSearchParams()
  const error = params.get("error") ?? "Default"
  const message = ERRORS[error] ?? ERRORS.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign-in Error</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2">{message}</p>
        <p className="text-xs text-slate-400 mb-6">Error code: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{error}</code></p>
        <Button asChild className="w-full" style={{ background: "#2D82B5" }}>
          <Link href="/auth/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
