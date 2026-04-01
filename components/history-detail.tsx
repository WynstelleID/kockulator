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
  courtFeePerHour: number;
  hoursPlayed: number;
  players: number;
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

export function HistoryDetail({ id }: { id: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [record, setRecord] = useState<SessionRecord | null>(null);

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
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Asia/Jakarta",
          }).format(new Date(record.savedAt))}
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
            value={`${formatNumber(record.usedShuttlecocks)} pcs`}
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
            label="Patungan per pemain"
            value={formatCurrency(record.costPerPlayer)}
            strong
          />
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
