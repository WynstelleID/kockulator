"use client";

import { Feather } from "lucide-react";

export function SplashScreen({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.2),transparent_32%),linear-gradient(180deg,#161616_0%,#101010_44%,#0b0b0b_100%)] px-6">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[36px] border border-white/10 bg-white/[0.08] px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="relative flex size-20 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/15 text-orange-300">
          <span className="absolute inset-0 rounded-full border border-orange-300/40 animate-ping" />
          <Feather className="relative z-10 size-9" />
        </div>
        <p className="mt-6 text-3xl font-black tracking-tight text-white">
          Kockulator
        </p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-orange-200">
          PT-PT Badminton
        </p>
        <p className="mt-4 text-sm leading-6 text-white/60">{label}</p>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[splash-load_1.2s_ease-in-out_infinite] rounded-full bg-orange-400" />
        </div>
      </div>
    </div>
  );
}
