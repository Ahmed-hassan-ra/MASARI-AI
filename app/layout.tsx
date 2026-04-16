import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Providers } from "./providers"
import { RootLayoutWrapper } from "@/components/root-layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Masari-AI Finance",
  description: "Your personal AI-powered finance manager for mobile and desktop",
  keywords: "finance, budget, expense tracker, mobile app, AI, personal finance",
  authors: [{ name: "Masari-AI Team" }],
  creator: "Masari-AI",
  publisher: "Masari-AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Masari-AI Finance",
  },
  openGraph: {
  title: "Masari-AI Finance",
  description: "Your personal AI-powered finance manager",
    type: "website",
    siteName: "Masari-AI Finance",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
  interactiveWidget: 'resizes-content',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS Safari optimizations */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Masari-AI" />
        
        {/* Android Chrome optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Performance and compatibility */}
        <meta name="renderer" content="webkit" />
        <meta name="force-rendering" content="webkit" />
        <meta name="browsermode" content="application" />
        
        {/* Touch icons for iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Prevent zoom on form inputs on iOS */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Additional mobile optimizations */}
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <RootLayoutWrapper session={session}>
            <div className="min-h-screen bg-background font-sans antialiased">
            {children}
            </div>
          </RootLayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
