"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowLeft } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

const C = { deep: "#015C92", primary: "#2D82B5" } as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
}

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly: your name, email address, and financial data you enter (income, expenses, budgets, goals). We also collect usage data to improve the service.",
  },
  {
    title: "How We Use Your Information",
    body: "Your data is used solely to provide the MASARI-AI service — to display your financial overview, generate AI insights, and send you notifications you request. We never sell your data to third parties.",
  },
  {
    title: "Data Storage & Security",
    body: "Your data is stored in a secure PostgreSQL database hosted on Supabase. Passwords are hashed using bcryptjs and never stored in plain text. All connections are encrypted via TLS.",
  },
  {
    title: "Third-Party Services",
    body: "We use Google OAuth for authentication (optional), Groq AI for generating financial insights, and Supabase for database and file storage. Each service has its own privacy policy.",
  },
  {
    title: "Your Rights",
    body: "You can delete your account and all associated data at any time from your profile settings. You can also export your data as CSV from the Reports section.",
  },
  {
    title: "Contact",
    body: "For any privacy-related questions, please reach out via our Contact page.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      <header className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg,${C.deep},${C.primary})` }}>
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span style={{ color: C.primary }}>MA<span style={{ color: C.deep }}>$</span>ARI-AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: C.primary }}>Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: April 2026</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={s.title} variants={fadeUp} initial="hidden" animate="show" custom={i}>
              <h2 className="text-xl font-semibold mb-2" style={{ color: C.primary }}>{s.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
