"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Wallet, ArrowLeft, ExternalLink, Target, Users, Zap, Heart } from "lucide-react"

const B = {
  dark: "#015C92",
  mid: "#2D82B5",
  light: "#88CDF6",
  lighter: "#BCE6FF",
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#eef0f8] dark:bg-[#060b14] text-slate-900 dark:text-white overflow-x-hidden">

      {/* Mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `${B.light}33` }} />
        <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `${B.lighter}44` }} />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `${B.light}22` }} />
      </div>

      {/* Navbar */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: B.dark }}>
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-slate-900 dark:text-white tracking-tight">
            MA<span style={{ color: B.mid }}>$</span>ARI-AI
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild className="text-slate-600 dark:text-white/60">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />Back</Link>
          </Button>
          <Button size="sm" className="text-white font-semibold rounded-xl border-0" style={{ background: B.dark }} asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-12 px-6 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: B.mid }}>About Us</p>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
            Built with purpose,<br />
            <span style={{ color: B.mid }}>driven by passion</span>
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            MASARI-AI started with a simple belief — managing your personal finances shouldn't
            require a finance degree. We build tools that make it effortless for everyone.
          </p>
        </motion.div>
      </section>

      {/* Mission cards */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Target, title: "Our Mission", desc: "Make financial clarity accessible to everyone, everywhere.", color: B.dark },
            { icon: Zap, title: "AI-First", desc: "Every feature is powered by AI to give you smarter insights automatically.", color: B.mid },
            { icon: Users, title: "For Everyone", desc: "Whether you're a student or a business owner — MASARI-AI works for you.", color: B.dark },
            { icon: Heart, title: "Built with Care", desc: "Every detail is crafted to make your experience smooth and enjoyable.", color: B.mid },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i * 0.5}
              className="rounded-2xl border p-6"
              style={{ background: `${B.lighter}44`, borderColor: `${B.light}66` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${item.color}18` }}>
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
              <p className="text-slate-500 dark:text-white/50 text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="rounded-2xl border border-white/60 dark:border-white/[0.08] p-8 md:p-10 bg-white/60 dark:bg-white/[0.05] backdrop-blur-xl"
          >
            <p className="text-sm font-semibold mb-4 uppercase tracking-widest" style={{ color: B.mid }}>Our Story</p>
            <p className="text-slate-700 dark:text-white/70 text-base leading-relaxed mb-4">
              MASARI-AI was born from a frustration shared by many — existing finance apps were
              either too complex, too expensive, or simply not smart enough. Most people end up
              tracking money in spreadsheets or not at all.
            </p>
            <p className="text-slate-700 dark:text-white/70 text-base leading-relaxed">
              We set out to build something different: a platform that combines the power of AI
              with a beautifully simple interface — one that feels like a financial partner, not
              just a ledger. MASARI-AI is that product.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Co-founder */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm font-semibold mb-2 uppercase tracking-widest" style={{ color: B.mid }}>The Team</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Meet the founder</h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={1}
            className="rounded-2xl border border-white/60 dark:border-white/[0.08] p-8 md:p-10 bg-white/70 dark:bg-white/[0.05] backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${B.light}, ${B.dark})`,
                    boxShadow: `0 12px 32px ${B.light}60`,
                  }}>
                  <span className="text-3xl font-black text-white">AH</span>
                </div>
                <a
                  href="https://www.linkedin.com/in/ahmed-hassan-ra/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: B.mid }}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ahmed Hassan Ramadan</h3>
                  <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto sm:mx-0"
                    style={{ background: `${B.lighter}`, color: B.dark }}>
                    Co-Founder
                  </span>
                </div>

                <p className="text-sm text-slate-400 dark:text-white/40 mb-4 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: B.light }} />
                  B.Sc. Computer Science — Management and Science University
                </p>

                <p className="text-slate-600 dark:text-white/60 leading-relaxed mb-4">
                  A software developer with a strong background in building scalable web platforms
                  and tech communities. Ahmed&apos;s passion is to make systems that solve real problems —
                  MASARI-AI is the product of that passion applied to personal finance.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["Web Development", "Scalable Systems", "Tech Communities", "AI Applications"].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium border"
                      style={{ background: `${B.lighter}66`, color: B.dark, borderColor: `${B.light}66` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Ready to take control?
          </h2>
          <p className="text-slate-500 dark:text-white/40 mb-8">Join MASARI-AI today — it&apos;s free.</p>
          <Button size="lg" className="text-white font-bold px-10 h-12 rounded-xl border-0"
            style={{ background: B.mid, boxShadow: `0 8px 24px ${B.light}80` }} asChild>
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/40 dark:border-white/[0.06] py-8 px-6 bg-white/30 dark:bg-white/[0.03] backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: B.dark }}>
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <span>MA<span style={{ color: B.mid }}>$</span>ARI-AI</span>
          </Link>
          <p className="text-slate-400 text-sm">© 2026 MASARI-AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-700 dark:hover:text-white transition-colors">Home</Link>
            <Link href="#" className="hover:text-slate-700 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-700 dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
