"use client";

import { Github, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-6 pb-4 text-center text-xs text-white/40">
      <div className="flex items-center justify-center gap-3">
        <a
          href="https://github.com/wynstelleID/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70 transition-colors hover:bg-white/10"
        >
          <Github className="size-4" />
        </a>
        <a
          href="https://www.linkedin.com/in/dandi-setiyawan/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70 transition-colors hover:bg-white/10"
        >
          <Linkedin className="size-4" />
        </a>
      </div>
      <p className="mt-3 tracking-[0.2em]">
        © 2026 Dandi Setiyawan. Built with passion.
      </p>
    </footer>
  );
}
