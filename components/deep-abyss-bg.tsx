"use client"

/**
 * DeepAbyssBg — Deep Abyss background for Masari AI
 * Anamorphic light rays + cobalt grid + grain + atmospheric glow
 */
export function DeepAbyssBg() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--abyss, #020617)" }}
    >
      {/* ── Grain overlay (SVG fractalNoise) ──────────────────────────────── */}
      <svg className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.03]">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ── Atmospheric underglow — center-right radial ────────────────────── */}
      <div
        className="absolute"
        style={{
          inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 75% 45%, #015C92 0%, transparent 70%)",
          opacity: 0.30,
        }}
      />

      {/* ── Anamorphic light rays (top-right origin) ──────────────────────── */}

      {/* Ray 1 — widest, most prominent */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          right: "-5%",
          width: "55%",
          height: "130%",
          background: "linear-gradient(215deg, #2D82B5 0%, transparent 60%)",
          filter: "blur(120px)",
          opacity: 0.22,
          transform: "rotate(-8deg)",
          transformOrigin: "top right",
        }}
      />

      {/* Ray 2 — narrower, sharper */}
      <div
        className="absolute"
        style={{
          top: "-15%",
          right: "5%",
          width: "28%",
          height: "120%",
          background: "linear-gradient(220deg, #BCE6FF 0%, #2D82B5 20%, transparent 65%)",
          filter: "blur(80px)",
          opacity: 0.14,
          transform: "rotate(-5deg)",
          transformOrigin: "top right",
        }}
      />

      {/* Ray 3 — thin streak */}
      <div
        className="absolute"
        style={{
          top: "-5%",
          right: "18%",
          width: "14%",
          height: "90%",
          background: "linear-gradient(210deg, #BCE6FF 0%, transparent 55%)",
          filter: "blur(50px)",
          opacity: 0.18,
          transform: "rotate(-12deg)",
          transformOrigin: "top right",
        }}
      />

      {/* Ray 4 — faint wide sweep */}
      <div
        className="absolute"
        style={{
          top: "-20%",
          right: "-15%",
          width: "70%",
          height: "110%",
          background: "linear-gradient(205deg, #015C92 0%, transparent 50%)",
          filter: "blur(160px)",
          opacity: 0.20,
          transform: "rotate(-3deg)",
          transformOrigin: "top right",
        }}
      />

      {/* ── Cobalt grid ───────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,   rgba(188,230,255,0.05) 0px, rgba(188,230,255,0.05) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(90deg,  rgba(188,230,255,0.05) 0px, rgba(188,230,255,0.05) 1px, transparent 1px, transparent 60px)
          `,
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 80% 20%, black 0%, transparent 70%)",
          maskImage:        "radial-gradient(ellipse 80% 80% at 80% 20%, black 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
