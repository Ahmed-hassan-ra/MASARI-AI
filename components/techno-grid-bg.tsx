"use client"

export function TechnoGridBg() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">

      {/* ── Grain overlay ─────────────────────────────────────────────────── */}
      <svg className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.035]">
        <filter id="tg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tg-grain)" />
      </svg>

      {/* ── Atmospheric underglow ─────────────────────────────────────────── */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 65% 55% at 78% 40%, #015C92 0%, transparent 70%)", opacity: 0.28 }} />

      {/* ── Cobalt grid with radial mask ──────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,  rgba(188,230,255,0.06) 0px, rgba(188,230,255,0.06) 1px, transparent 1px, transparent 64px),
            repeating-linear-gradient(90deg, rgba(188,230,255,0.06) 0px, rgba(188,230,255,0.06) 1px, transparent 1px, transparent 64px)
          `,
          WebkitMaskImage: "radial-gradient(ellipse 90% 85% at 75% 25%, black 0%, transparent 68%)",
          maskImage:        "radial-gradient(ellipse 90% 85% at 75% 25%, black 0%, transparent 68%)",
        }}
      />

      {/* ── Anamorphic rays ───────────────────────────────────────────────── */}

      {/* Ray 1 — wide sweep */}
      <div className="absolute animate-ray-1"
        style={{
          top: "-20%", right: "-8%",
          width: "60%", height: "140%",
          background: "linear-gradient(218deg, #2D82B5 0%, transparent 58%)",
          filter: "blur(120px)",
          opacity: 0.20,
          transform: "rotate(-6deg)",
          transformOrigin: "top right",
        }} />

      {/* Ray 2 — bright narrow streak */}
      <div className="absolute animate-ray-2"
        style={{
          top: "-10%", right: "8%",
          width: "22%", height: "110%",
          background: "linear-gradient(222deg, #BCE6FF 0%, #2D82B5 25%, transparent 62%)",
          filter: "blur(72px)",
          opacity: 0.18,
          transform: "rotate(-4deg)",
          transformOrigin: "top right",
        }} />

      {/* Ray 3 — thin sharp line */}
      <div className="absolute animate-ray-3"
        style={{
          top: "-5%", right: "22%",
          width: "10%", height: "85%",
          background: "linear-gradient(212deg, #BCE6FF 0%, transparent 52%)",
          filter: "blur(44px)",
          opacity: 0.22,
          transform: "rotate(-14deg)",
          transformOrigin: "top right",
        }} />

      {/* Ray 4 — faint wide halo */}
      <div className="absolute animate-ray-1"
        style={{
          top: "-25%", right: "-20%",
          width: "75%", height: "120%",
          background: "linear-gradient(208deg, #015C92 0%, transparent 48%)",
          filter: "blur(180px)",
          opacity: 0.18,
          transform: "rotate(-2deg)",
          transformOrigin: "top right",
        }} />

      {/* ── Keyframe styles ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes ray-breathe-1 {
          0%, 100% { opacity: 0.20; }
          50%       { opacity: 0.30; }
        }
        @keyframes ray-breathe-2 {
          0%, 100% { opacity: 0.18; }
          50%       { opacity: 0.26; }
        }
        @keyframes ray-breathe-3 {
          0%, 100% { opacity: 0.22; }
          50%       { opacity: 0.32; }
        }
        .animate-ray-1 { animation: ray-breathe-1 6s ease-in-out infinite; }
        .animate-ray-2 { animation: ray-breathe-2 8s ease-in-out infinite 1s; }
        .animate-ray-3 { animation: ray-breathe-3 5s ease-in-out infinite 2s; }
      `}</style>
    </div>
  )
}
