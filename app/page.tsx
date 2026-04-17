"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useSpring, useMotionValue } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import {
  Wallet, BarChart3, Receipt, ShieldCheck,
  TrendingUp, ArrowRight, CheckCircle2, Brain, Target,
  Search, Bell, Mail, Settings, RefreshCw, ChevronDown,
  PlusCircle,
} from "lucide-react"

/* ─────────────────────────────────────────────────────────────────
   PALETTE (single source of truth — zero purple/violet/indigo)
   ───────────────────────────────────────────────────────────────── */
const C = {
  deep:    "#015C92",   // headings, main accent
  primary: "#2D82B5",   // logo, primary buttons
  icy:     "#BCE6FF",   // glow, glass tints
  abyss:   "#020617",   // dark background
} as const

/* ─────────────────────────────────────────────────────────────────
   THEME TOGGLE
   ───────────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-9 h-9 rounded-xl" />
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
      style={{ background: "var(--lp-badge-bg)", border: "1px solid var(--lp-badge-border)" }}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark"
        ? <Sun  className="h-4 w-4" style={{ color: C.icy }} />
        : <Moon className="h-4 w-4" style={{ color: C.deep }} />}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────
   GLASS CARD — gradient refraction border wrapper
   ───────────────────────────────────────────────────────────────── */
function GlassCard({
  children,
  className = "",
  style = {},
  glow = false,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  glow?: boolean
}) {
  return (
    <motion.div
      className="rounded-2xl p-px"
      style={{
        background: "var(--lp-card-border)",
        boxShadow: glow ? "var(--lp-card-glow)" : undefined,
      }}
      whileHover={{ scale: 1.02, boxShadow: "var(--lp-card-glow-hover)" }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <div
        className={`rounded-2xl backdrop-blur-xl ${className}`}
        style={{
          background: "var(--lp-card-bg)",
          boxShadow: "var(--lp-card-shadow)",
          ...style,
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   BACKGROUND BLOBS — volumetric deep-sea (#015C92 + #BCE6FF)
   ───────────────────────────────────────────────────────────────── */
const BLOBS = [
  { varColor: "--lp-blob-1", varOp: "--lp-blob-1-op", size: 720, left: "-14%", top: "-18%", dur: 22, delay: 0 },
  { varColor: "--lp-blob-2", varOp: "--lp-blob-2-op", size: 560, left: "58%",  top: "4%",   dur: 28, delay: 6 },
  { varColor: "--lp-blob-3", varOp: "--lp-blob-3-op", size: 500, left: "18%",  top: "58%",  dur: 34, delay: 12 },
]

const blobAnim = (i: number) => ({
  x:     [0,  45 + i * 10, -28 - i * 7,  38 + i * 5, 0],
  y:     [0, -55 + i * 7,   30 + i * 6, -40 - i * 4, 0],
  scale: [1,  1.10,          0.93,         1.06,        1],
})

function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size, height: b.size,
            background: `var(${b.varColor})`,
            opacity: `var(${b.varOp})`,
            filter: "blur(180px)",
            left: b.left, top: b.top,
          }}
          animate={blobAnim(i)}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   GRAIN OVERLAY — SVG fractalNoise, matte-steel feel
   ───────────────────────────────────────────────────────────────── */
function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none select-none"
      style={{ opacity: "var(--lp-noise-op)" }}
      aria-hidden
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="ds-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ds-grain)" />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   MOUSE SPOTLIGHT — blue glow that tracks the cursor
   ───────────────────────────────────────────────────────────────── */
function MouseSpotlight() {
  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 })
  const [bg, setBg] = useState("none")

  useEffect(() => {
    const h = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [mouseX, mouseY])

  useEffect(() => {
    const unsub = springX.on("change", () => {
      setBg(`radial-gradient(700px circle at ${springX.get()}px ${springY.get()}px, var(--lp-spotlight), transparent 65%)`)
    })
    return unsub
  }, [springX, springY])

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none" style={{ background: bg }} />
  )
}

/* ─────────────────────────────────────────────────────────────────
   LINE CHART — #015C92 → #BCE6FF gradient
   ───────────────────────────────────────────────────────────────── */
function LineChart({ height = 60 }: { height?: number }) {
  const pts = [10, 35, 22, 50, 32, 46, 28, 58, 42, 50, 36, 62]
  const w = 220
  const step = w / (pts.length - 1)
  const max = Math.max(...pts)
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - (p / max) * height}`).join(" ")
  const areaD = pathD + ` L ${(pts.length - 1) * step} ${height} L 0 ${height} Z`
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full">
      <defs>
        <linearGradient id="lc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={C.deep}    />
          <stop offset="100%" stopColor={C.icy}     />
        </linearGradient>
        <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.primary} stopOpacity="0.22" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lc-area)" />
      <path d={pathD} fill="none" stroke="url(#lc-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD MOCKUP — translucent glass, mode-aware
   ───────────────────────────────────────────────────────────────── */
function DashboardMockup() {
  const inner: React.CSSProperties = {
    background: "var(--lp-dash-inner-bg)",
    border: "1px solid var(--lp-dash-inner-border)",
    boxShadow: "var(--lp-dash-inner-shadow)",
  }
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "var(--lp-dash-bg)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid var(--lp-dash-border)",
        boxShadow: "var(--lp-dash-shadow)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--lp-dash-topbar)" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${C.deep},${C.primary})` }}>
            <Wallet className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">MA$ARI-AI</span>
          <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="flex-1 mx-4 hidden sm:block">
          <p className="text-xs font-semibold text-slate-400">Welcome back 👋</p>
        </div>
        <div className="flex items-center gap-2">
          {[Settings, Mail, Bell].map((Icon, i) => (
            <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${C.primary}14` }}>
              <Icon className="h-3 w-3 text-slate-400" />
            </div>
          ))}
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${C.deep},${C.primary})` }}>
            <span className="text-[9px] font-bold text-white">AH</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden sm:flex w-36 flex-col p-2.5 gap-0.5"
          style={{
            borderRight: "1px solid var(--lp-dash-sidebar-border)",
            background: "var(--lp-dash-sidebar-bg)",
          }}>
          <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
            <Search className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Search</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 px-2 mt-1 mb-0.5 uppercase tracking-wider">Main Menu</p>
          {[
            { icon: BarChart3,  label: "Dashboard",    active: true },
            { icon: Wallet,     label: "Wallets" },
            { icon: TrendingUp, label: "Analytics",    badge: true },
            { icon: RefreshCw,  label: "Transactions" },
            { icon: Receipt,    label: "Invoices" },
          ].map(item => (
            <div key={item.label}
              className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium"
              style={item.active
                ? {
                    background: `linear-gradient(135deg,${C.deep}28,${C.primary}14)`,
                    color: C.icy,
                    border: `1px solid ${C.primary}35`,
                  }
                : { color: "rgba(148,163,184,0.55)" }}>
              <div className="flex items-center gap-1.5">
                <item.icon className="h-3 w-3 flex-shrink-0" />
                {item.label}
              </div>
              {item.badge && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: `${C.primary}22` }}>
                  <span className="text-[8px] font-bold" style={{ color: C.icy }}>3</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 p-3 min-w-0" style={{ background: "var(--lp-dash-content-bg)" }}>
          <div className="grid grid-cols-2 gap-2 mb-2">

            {/* Earning Overview */}
            <div className="rounded-xl p-3" style={inner}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-medium">Earning Overview</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                  This Month <ChevronDown className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">$20,520.32</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>+15%</span>
              </div>
              <LineChart height={50} />
              <div className="flex gap-2 mt-1">
                {["Jan","Feb","Mar","Apr","May","Jun"].map(m => (
                  <span key={m} className="text-[8px] text-slate-400 flex-1 text-center">{m}</span>
                ))}
              </div>
            </div>

            {/* Spending Overview */}
            <div className="rounded-xl p-3" style={inner}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-medium">Spending Overview</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                  This Month <ChevronDown className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">$8,240.18</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>-8%</span>
              </div>
              <div className="flex gap-2 text-[9px] text-slate-400 mb-1.5">
                {[
                  { l: "Housing", c: C.deep    },
                  { l: "Markets", c: C.primary },
                  { l: "Other",   c: C.icy     },
                ].map(x => (
                  <span key={x.l} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: x.c }} />{x.l}
                  </span>
                ))}
              </div>
              {/* Segmented bar — #015C92 → #2D82B5 → #BCE6FF */}
              <div className="flex rounded-full overflow-hidden h-2">
                <div style={{ width: "45%", background: C.deep    }} />
                <div style={{ width: "35%", background: C.primary }} />
                <div style={{ width: "20%", background: C.icy     }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Cash Flow */}
            <div className="rounded-xl p-3" style={inner}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-medium">Cash Flow</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                  Yearly <ChevronDown className="h-2.5 w-2.5" />
                </span>
              </div>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">$342,323.44</span>
              <div className="flex items-end gap-0.5 h-8 mt-2">
                {[40,60,35,75,50,65,45,80,55,70,48,85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{ height: `${h}%`, background: `${C.deep}1a` }}>
                    <div className="w-full rounded-sm"
                      style={{
                        height: i > 8 ? "100%" : "0%",
                        background: `linear-gradient(to top,${C.deep},${C.icy})`,
                      }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className="rounded-xl p-3" style={inner}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 font-medium">Upcoming Bills</span>
                <PlusCircle className="h-3 w-3 text-slate-400" />
              </div>
              {[
                { name: "House Rent",  amount: "$1,200", c: C.deep,    date: "Jun 30" },
                { name: "Electricity", amount: "$85.00",  c: C.primary, date: "Jul 3"  },
              ].map(bill => (
                <div key={bill.name} className="flex items-center justify-between py-1.5"
                  style={{ borderBottom: `1px solid ${C.primary}14` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center"
                      style={{ background: `${bill.c}22` }}>
                      <span className="text-[7px] font-bold" style={{ color: bill.c }}>{bill.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{bill.name}</p>
                      <p className="text-[8px] text-slate-400">{bill.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{bill.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ───────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.10, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
}

const springIn = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 20, delay: 0.45 },
  },
}

/* ─────────────────────────────────────────────────────────────────
   BLUE ICON BADGE
   ───────────────────────────────────────────────────────────────── */
function BlueIcon({ Icon }: { Icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
      style={{ background: `${C.deep}18` }}>
      <Icon className="h-5 w-5" style={{ color: C.primary }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PRIMARY BUTTON helper
   ───────────────────────────────────────────────────────────────── */
function PrimaryBtn({ children, href, size = "default" }: {
  children: React.ReactNode
  href: string
  size?: "default" | "lg" | "sm"
}) {
  return (
    <Button
      size={size}
      className="font-bold rounded-xl border-0 text-white transition-all duration-200"
      style={{
        background: C.primary,
        boxShadow: `0 0 32px ${C.primary}50`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = C.icy
        el.style.color = C.deep
        el.style.boxShadow = `0 0 40px ${C.icy}80`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = C.primary
        el.style.color = "#fff"
        el.style.boxShadow = `0 0 32px ${C.primary}50`
      }}
      asChild
    >
      <Link href={href}>{children}</Link>
    </Button>
  )
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-[#015C92] dark:text-white overflow-x-hidden transition-colors duration-300">

      <GrainOverlay />
      <MouseSpotlight />
      <BackgroundBlobs />

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg,${C.deep},${C.primary})` }}>
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="tracking-tight" style={{ color: C.primary }}>
            MA<span style={{ color: C.deep }}>$</span>ARI-AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "#",         label: "Home"     },
            { href: "/about",    label: "About Us" },
            { href: "#features", label: "Features" },
            { href: "#pricing",  label: "Pricing"  },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PrimaryBtn href="/auth/register" size="sm">Get Started</PrimaryBtn>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-10">

        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl mb-6"
          style={{ color: "var(--lp-heading)" }}
        >
          <span className="text-slate-900 dark:text-white">Streamline your</span><br />
          <span style={{ color: C.primary }}>
            financial
          </span>
          <span className="text-slate-900 dark:text-white"> operations</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="text-base md:text-lg max-w-xl mb-10 leading-relaxed text-slate-600 dark:text-slate-400"
        >
          Empower your financial management with MASARI-AI — the leading platform
          designed to streamline your income, expenses, budgets, and AI-powered insights.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="flex items-center gap-3">
          <PrimaryBtn href="/auth/register" size="lg">Get Started Free</PrimaryBtn>
          <Button size="lg" variant="ghost"
            className="h-12 px-8 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            style={{ background: "var(--lp-btn-sec-bg)", border: "1px solid var(--lp-btn-sec-border)" }}
            asChild>
            <Link href="#features">Learn more</Link>
          </Button>
        </motion.div>

        {/* Dashboard — springs into place */}
        <motion.div
          variants={springIn}
          initial="hidden"
          animate="show"
          className="w-full max-w-4xl mt-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <DashboardMockup />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: C.primary }}>Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Everything you need to manage</h2>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-400 dark:text-slate-500">your money in one place</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Brain,       title: "AI-Powered Insights",      desc: "Get personalized financial advice and spending analysis. Understand your money like never before."   },
              { icon: BarChart3,   title: "Smart Budgeting",           desc: "Create budgets, set category limits, and track progress in real time with beautiful charts."         },
              { icon: Receipt,     title: "Receipt Scanner",           desc: "Snap a photo of any receipt and let AI extract details automatically. No more manual entry."          },
              { icon: TrendingUp,  title: "Income & Expense Tracking", desc: "Log all income and expenses in one place. Auto-categorize and see exactly where your money goes."    },
              { icon: Target,      title: "Savings Goals",             desc: "Set financial goals and track progress — vacation, car, emergency fund, we keep you on track."        },
              { icon: ShieldCheck, title: "Secure & Private",          desc: "Your data is encrypted and stored securely. We never sell your data or share it with third parties." },
            ].map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true }} custom={i * 0.35}>
                <GlassCard className="p-6 h-full cursor-default">
                  <BlueIcon Icon={f.icon} />
                  <h3 className="font-semibold text-slate-800 dark:text-white text-base mb-2">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-10 px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="flex justify-center">
          <PrimaryBtn href="/about">
            Meet the Team <ArrowRight className="ml-2 h-4 w-4 inline" />
          </PrimaryBtn>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: C.primary }}>How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Up and running in</h2>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-200 dark:text-slate-700">3 simple steps</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your account", desc: "Sign up for free in seconds — no credit card needed. Just your email and you're in." },
              { step: "02", title: "Add your finances",   desc: "Log your income and expenses, or scan receipts. Set up your first budget in minutes." },
              { step: "03", title: "Let AI guide you",    desc: "Get personalized insights, budget tips, and recommendations to improve your financial health." },
            ].map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true }} custom={i * 0.5}>
                <div
                  className="text-5xl font-black mb-4 leading-none bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg,${C.deep},${C.primary})`,
                    opacity: 0.60,
                  }}
                >
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: C.primary }}>Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Simple, honest pricing</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* FREE */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <GlassCard className="p-8 flex flex-col h-full">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Free</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-400 mb-1">/ forever</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">Basic access, always free</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {["Expense & income tracking","Up to 3 budgets","Basic reports","Receipt scanner (5/month)","Community support"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-slate-300 dark:text-slate-600" />{f}
                    </li>
                  ))}
                  {["Unlimited budgets","AI insights & assistant","Unlimited receipt scans"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600 line-through">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-slate-200 dark:text-slate-700" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  style={{ background: "var(--lp-btn-sec-bg)", border: "1px solid var(--lp-btn-sec-border)" }}
                  onClick={() => window.location.href = "/auth/register"}>
                  Continue with Free
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">You will miss Pro features</p>
              </GlassCard>
            </motion.div>

            {/* PRO */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}>
              <GlassCard glow className="p-8 flex flex-col h-full relative overflow-hidden">
                <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl pointer-events-none"
                  style={{ background: `${C.primary}1a` }} />
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-white text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: `linear-gradient(135deg,${C.deep},${C.primary})` }}>RECOMMENDED</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full border"
                      style={{ color: C.primary, background: `${C.icy}22`, borderColor: `${C.primary}30` }}>
                      🎉 FREE AT LAUNCH
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Pro</h3>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-xl font-bold line-through text-slate-300 dark:text-slate-600">$9</span>
                    <span className="text-4xl font-black"
                      style={{ color: C.primary, filter: `drop-shadow(0 0 12px ${C.primary}55)` }}>$0</span>
                    <span className="text-slate-400 mb-1">/ month</span>
                  </div>
                  <p className="text-xs font-medium mb-6 opacity-80" style={{ color: C.primary }}>
                    Free during launch — price increases after
                  </p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {["Expense & income tracking","Unlimited budgets","AI insights & assistant","Unlimited receipt scans","Advanced reports & exports","Priority support"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <CheckCircle2
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: C.primary, filter: `drop-shadow(0 0 5px ${C.primary}55)` }}
                        />{f}
                      </li>
                    ))}
                  </ul>
                  <PrimaryBtn href="/auth/register">Get Full Access — It&apos;s Free</PrimaryBtn>
                  <p className="text-center text-xs opacity-60 mt-2" style={{ color: C.primary }}>
                    Price will increase after launch
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Start managing your money
          </h2>
          <h2
            className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg,${C.deep},${C.primary},${C.icy})` }}
          >
            the smart way — today
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
            Join thousands of people who use MASARI-AI to take control of their finances.
          </p>
          <PrimaryBtn href="/auth/register" size="lg">
            Create Free Account <ArrowRight className="ml-2 h-4 w-4 inline" />
          </PrimaryBtn>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="relative z-10 py-10 px-6 backdrop-blur-sm"
        style={{
          borderTop: "1px solid var(--lp-footer-border)",
          background: "var(--lp-footer-bg)",
        }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg,${C.deep},${C.primary})` }}>
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <span style={{ color: C.primary }}>
              MA<span style={{ color: C.deep }}>$</span>ARI-AI
            </span>
          </Link>
          <p className="text-slate-400 text-sm">© 2026 MASARI-AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            {[
              { href: "/about", label: "About Us" },
              { href: "#",      label: "Privacy"  },
              { href: "#",      label: "Terms"    },
              { href: "#",      label: "Contact"  },
            ].map(l => (
              <Link key={l.label} href={l.href}
                className="transition-colors hover:text-slate-900 dark:hover:text-white"
                style={{ ["--hover-color" as string]: C.primary }}
                onMouseEnter={e => (e.currentTarget.style.color = C.primary)}
                onMouseLeave={e => (e.currentTarget.style.color = "")}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
