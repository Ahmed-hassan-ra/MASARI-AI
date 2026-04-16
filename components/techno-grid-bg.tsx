"use client"

export function TechnoGridBg() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#020617]">

      {/* ── Grain ─────────────────────────────────────────────────────────── */}
      <svg className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.04]">
        <filter id="tg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tg-grain)" />
      </svg>

      {/* ── Big glow source — top-right spotlight ────────────────────────── */}
      <div
        className="absolute animate-glow-breathe"
        style={{
          top: "-20%",
          right: "-10%",
          width: "70%",
          height: "80%",
          background: "radial-gradient(ellipse at top right, #2D82B5 0%, #015C92 30%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.75,
        }}
      />

      {/* ── Secondary inner glow (brighter core) ─────────────────────────── */}
      <div
        className="absolute animate-glow-breathe"
        style={{
          top: "-10%",
          right: "-5%",
          width: "40%",
          height: "50%",
          background: "radial-gradient(ellipse at top right, #BCE6FF 0%, #2D82B5 40%, transparent 75%)",
          filter: "blur(40px)",
          opacity: 0.55,
          animationDelay: "1s",
        }}
      />

      {/* ── The grid — masked to only show where light hits ──────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(188,230,255,0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(188,230,255,0.25) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 95% 5%, black 0%, black 30%, transparent 72%)",
          maskImage:        "radial-gradient(ellipse 85% 75% at 95% 5%, black 0%, black 30%, transparent 72%)",
        }}
      />

      {/* ── Keyframes ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50%       { opacity: 0.90; transform: scale(1.04); }
        }
        .animate-glow-breathe {
          animation: glow-breathe 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
