"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Feather,
  Landmark,
  MessageCircleMore,
  Users,
  Wallet,
} from "lucide-react";
import { SplashScreen } from "@/components/splash-screen";

type SessionRecord = {
  id: string;
  savedAt: string;
  shuttlecockTubePrice: number;
  autoPricePerCock: number;
  roundedPricePerCock: number;
  usedShuttlecocks: number;
  isShuttlecockSponsored: boolean;
  courtFeePerHour: number;
  hoursPlayed: number;
  players: number;
  isPerPlayerRounded: boolean;
  baseCostPerPlayer: number;
  totalCourtCost: number;
  totalShuttlecockCost: number;
  totalSessionCost: number;
  costPerPlayer: number;
};

const STORAGE_KEY = "kockulator-session-history";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReceiptSvg(record: SessionRecord) {
  const lines = [
    ["Tanggal", formatDate(record.savedAt)],
    ["Harga slop", formatCurrency(record.shuttlecockTubePrice)],
    ["Harga/kok", formatCurrency(record.roundedPricePerCock)],
    [
      "Kok terpakai",
      `${formatNumber(record.usedShuttlecocks)} pcs${
        record.isShuttlecockSponsored ? " (dibayarin)" : ""
      }`,
    ],
    ["Biaya kok", formatCurrency(record.totalShuttlecockCost)],
    ["Biaya lapangan", formatCurrency(record.totalCourtCost)],
    ["Jumlah pemain", `${formatNumber(record.players)} orang`],
    ["Rounding per orang", record.isPerPlayerRounded ? "Aktif" : "Tidak aktif"],
  ];

  const rows = lines
    .map(
      ([label, value], index) => `
        <text x="56" y="${250 + index * 72}" fill="#A3A3A3" font-size="24" font-family="Arial, Helvetica, sans-serif">${escapeSvg(label)}</text>
        <text x="824" y="${250 + index * 72}" fill="#F7F7F7" font-size="24" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeSvg(value)}</text>
        <line x1="56" y1="${275 + index * 72}" x2="824" y2="${255 + index * 72}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      `,
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="880" height="1120" viewBox="0 0 880 1120">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#181818"/>
          <stop offset="100%" stop-color="#0C0C0C"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stop-color="rgba(249,115,22,0.35)"/>
          <stop offset="100%" stop-color="rgba(249,115,22,0)"/>
        </radialGradient>
      </defs>
      <rect width="880" height="1120" fill="url(#bg)"/>
      <rect width="880" height="210" fill="url(#glow)"/>
      <text x="56" y="88" fill="#FDBA74" font-size="26" font-family="Arial, Helvetica, sans-serif" font-weight="700">Kockulator PT-PT</text>
      <text x="56" y="142" fill="#F7F7F7" font-size="56" font-family="Arial, Helvetica, sans-serif" font-weight="900">E-Receipt Badminton</text>
      <text x="56" y="188" fill="#A3A3A3" font-size="24" font-family="Arial, Helvetica, sans-serif">${escapeSvg(
        formatDate(record.savedAt),
      )}</text>
      <rect x="56" y="820" width="768" height="146" fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.22)" stroke-width="2"/>
      <text x="92" y="868" fill="#FDBA74" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="700">Total sesi</text>
      <text x="92" y="928" fill="#FFFFFF" font-size="58" font-family="Arial, Helvetica, sans-serif" font-weight="900">${escapeSvg(
        formatCurrency(record.totalSessionCost),
      )}</text>
      <text x="56" y="1026" fill="#FDBA74" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="700">Patungan per orang</text>
      <text x="56" y="1088" fill="#FFFFFF" font-size="54" font-family="Arial, Helvetica, sans-serif" font-weight="900">${escapeSvg(
        formatCurrency(record.costPerPlayer),
      )}</text>
      ${rows}
    </svg>
  `;
}

async function svgToPngBlob(svgMarkup: string) {
  const svgBlob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 880;
    canvas.height = 1120;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not supported.");
    }

    context.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Failed to create PNG receipt."));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function HistoryDetail({ id }: { id: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [record, setRecord] = useState<SessionRecord | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const splashTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 900);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return () => {
        window.clearTimeout(splashTimer);
      };
    }

    try {
      const parsed = JSON.parse(raw) as SessionRecord[];
      if (Array.isArray(parsed)) {
        setRecord(parsed.find((entry) => entry.id === id) ?? null);
      }
    } catch {
      setRecord(null);
    }

    return () => {
      window.clearTimeout(splashTimer);
    };
  }, [id]);

  if (!isMounted || showSplash) {
    return <SplashScreen label="Membuka detail sesi badminton..." />;
  }

  if (!record) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-5">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/[0.07] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <h1 className="text-2xl font-black">Detail tidak ditemukan</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Riwayat ini sudah dihapus atau belum tersedia di device ini.
          </p>
        </section>
      </main>
    );
  }

  async function shareReceiptToWhatsapp() {
    if (!record) return;
    try {
      setIsSharing(true);
      const pngBlob = await svgToPngBlob(buildReceiptSvg(record));
      const file = new File([pngBlob], `kockulator-receipt-${record.id}.png`, {
        type: "image/png",
      });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
        });
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = file.name;
      downloadLink.click();
      URL.revokeObjectURL(imageUrl);

      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          "E-receipt sudah diunduh. Tinggal lampirkan 1 gambar receipt ke WhatsApp.",
        )}`,
        "_blank",
        "noopener,noreferrer",
      );
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-5">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </Link>

      <section className="mt-5 rounded-4xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 text-orange-300">
          <CalendarDays className="size-4" />
          <p className="text-sm font-semibold">Detail sesi</p>
        </div>
        <h1 className="mt-3 text-3xl font-black text-white">
          {formatCurrency(record.totalSessionCost)}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {formatDate(record.savedAt)}
        </p>

        <div className="mt-5 grid gap-3 rounded-[28px] border border-white/10 bg-black/30 p-4">
          <DetailRow
            icon={<Feather className="size-4" />}
            label="Harga slop"
            value={formatCurrency(record.shuttlecockTubePrice)}
          />
          <DetailRow
            icon={<Wallet className="size-4" />}
            label="Harga/kok otomatis"
            value={formatCurrency(record.autoPricePerCock)}
          />
          <DetailRow
            icon={<Wallet className="size-4" />}
            label="Harga/kok dibulatkan"
            value={formatCurrency(record.roundedPricePerCock)}
          />
          <DetailRow
            icon={<Feather className="size-4" />}
            label="Kok terpakai"
            value={`${formatNumber(record.usedShuttlecocks)} pcs${record.isShuttlecockSponsored ? " (dibayarin)" : ""}`}
          />
          <DetailRow
            icon={<Landmark className="size-4" />}
            label="Biaya lapangan per jam"
            value={formatCurrency(record.courtFeePerHour)}
          />
          <DetailRow
            icon={<Clock3 className="size-4" />}
            label="Total jam main"
            value={`${formatNumber(record.hoursPlayed)} jam`}
          />
          <DetailRow
            icon={<Users className="size-4" />}
            label="Jumlah pemain"
            value={`${formatNumber(record.players)} orang`}
          />
          <DetailRow
            icon={<Feather className="size-4" />}
            label="Total biaya kok"
            value={formatCurrency(record.totalShuttlecockCost)}
          />
          <DetailRow
            icon={<Landmark className="size-4" />}
            label="Total biaya lapangan"
            value={formatCurrency(record.totalCourtCost)}
          />
          <DetailRow
            icon={<Users className="size-4" />}
            label="Base per pemain"
            value={formatCurrency(
              record.baseCostPerPlayer ?? record.costPerPlayer,
            )}
          />
          <DetailRow
            icon={<Users className="size-4" />}
            label="Rounding per pemain"
            value={
              record.isPerPlayerRounded
                ? "Aktif, dibulatkan ke atas"
                : "Tidak aktif"
            }
          />
          <DetailRow
            icon={<Users className="size-4" />}
            label="Patungan per pemain"
            value={formatCurrency(record.costPerPlayer)}
            strong
          />
        </div>
        <div className="mt-5 grid grid-cols gap-3">
          <button
            type="button"
            onClick={shareReceiptToWhatsapp}
            disabled={isSharing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-neutral-950 transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          >
            <MessageCircleMore className="size-4" />
            {isSharing ? "Menyiapkan..." : "Share WhatsApp"}
          </button>
        </div>
      </section>

      <footer className="mt-6 pb-4 text-center text-xs uppercase tracking-[0.2em] text-white/40">
        Created by dandi setiyawan
      </footer>
    </main>
  );
}

function DetailRow({
  icon,
  label,
  value,
  strong = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-3 last:border-none last:pb-0">
      <div className="flex items-center gap-2 text-white/60">
        <span className="text-orange-300">{icon}</span>
        <p className="text-sm">{label}</p>
      </div>
      <p
        className={
          strong
            ? "text-base font-black text-orange-300"
            : "text-sm font-semibold text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}
