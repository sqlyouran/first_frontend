import BrandLogo from "./BrandLogo";

export default function AuthPanel() {
  return (
    <div
      data-testid="auth-panel"
      className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-8 py-12"
    >
      {/* Stars */}
      <div className="absolute inset-0">
        <div className="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-white/60" />
        <div className="absolute left-[45%] top-[12%] h-1.5 w-1.5 rounded-full bg-white/40" />
        <div className="absolute left-[75%] top-[25%] h-1 w-1 rounded-full bg-white/50" />
        <div className="absolute left-[25%] top-[45%] h-0.5 w-0.5 rounded-full bg-white/30" />
        <div className="absolute left-[65%] top-[40%] h-1 w-1 rounded-full bg-white/40" />
        <div className="absolute left-[85%] top-[55%] h-0.5 w-0.5 rounded-full bg-white/20" />
      </div>

      {/* Distant city glow */}
      <div className="absolute bottom-[30%] left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Mountain silhouettes */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,200 L0,140 Q100,80 200,120 Q300,60 400,100 Q500,40 600,90 Q700,50 800,80 L800,200 Z"
          className="fill-slate-800/50"
        />
        <path
          d="M0,200 L0,160 Q150,110 300,140 Q450,90 600,130 Q700,100 800,120 L800,200 Z"
          className="fill-slate-900/60"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="text-white">
          <BrandLogo />
        </div>
        <p className="max-w-xs text-lg text-white/80">
          Discover the China beyond postcards.
        </p>
      </div>
    </div>
  );
}
