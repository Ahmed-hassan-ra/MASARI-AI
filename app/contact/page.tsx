"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

const C = {
  deep:    "#015C92",
  primary: "#2D82B5",
  icy:     "#BCE6FF",
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to send message")
        setStatus("error")
        return
      }
      setStatus("success")
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch {
      setErrorMsg("An unexpected error occurred")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
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

      <main className="max-w-2xl mx-auto px-6 py-16">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: C.primary }}>Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Have a question, feedback, or just want to say hi? Send us a message and we&apos;ll get back to you.
          </p>
        </motion.div>

        {status === "success" ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            className="flex flex-col items-center text-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${C.primary}18` }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: C.primary }} />
            </div>
            <h2 className="text-2xl font-bold">Message Sent!</h2>
            <p className="text-slate-500 dark:text-slate-400">We&apos;ll get back to you as soon as possible.</p>
            <Button variant="outline" onClick={() => setStatus("idle")} className="mt-4">Send another message</Button>
          </motion.div>
        ) : (
          <motion.form variants={fadeUp} initial="hidden" animate="show" custom={1}
            onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Your name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="What's this about?" value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Your message..." rows={6} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            </div>

            <Button type="submit" disabled={status === "loading"} className="w-full font-bold text-white rounded-xl"
              style={{ background: C.primary, boxShadow: `0 0 24px ${C.primary}40` }}>
              {status === "loading" ? "Sending..." : (
                <><Send className="mr-2 h-4 w-4" /> Send Message</>
              )}
            </Button>
          </motion.form>
        )}
      </main>
    </div>
  )
}
