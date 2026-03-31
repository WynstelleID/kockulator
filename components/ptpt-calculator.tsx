"use client";

import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock3,
  Feather,
  ExternalLink,
  History,
  Save,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";

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

function formatIntegerInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number(digitsOnly));
}

function toSafeNumber(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function Field({
  label,
  hint,
  icon,
  value,
  onChange,
  step = "1",
  type = "number",
  inputMode = "decimal",
}: {
  label: string;
  hint: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  type?: "number" | "text";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-2xl bg-orange-500/15 p-2 text-orange-300">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs leading-5 text-white/[0.55]">{hint}</p>
        </div>
      </div>
      <input
        type={type}
        inputMode={inputMode}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? step : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 rounded-2xl border border-white/10 bg-black/35 px-4 text-lg font-semibold text-white outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/30"
      />
    </label>
  );
}

export function PtPtCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [tubePrice, setTubePrice] = useState("135.000");
  const [roundedPrice, setRoundedPrice] = useState("13.000");
  const [usedShuttlecocks, setUsedShuttlecocks] = useState("6");
  const [courtFeePerHour, setCourtFeePerHour] = useState("45.000");
  const [hoursPlayed, setHoursPlayed] = useState("2");
  const [players, setPlayers] = useState("12");
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setIsMounted(true);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SessionRecord[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const calculations = useMemo(() => {
    const shuttlecockTubePrice = toSafeNumber(tubePrice);
    const autoPricePerCock = shuttlecockTubePrice / 12;
    const manualRoundedPrice = toSafeNumber(roundedPrice);
    const roundedPricePerCock =
      manualRoundedPrice > 0 ? manualRoundedPrice : autoPricePerCock;
    const used = toSafeNumber(usedShuttlecocks);
    const hourlyCourtFee = toSafeNumber(courtFeePerHour);
    const totalHours = toSafeNumber(hoursPlayed);
    const totalPlayers = Math.max(toSafeNumber(players), 1);
    const totalShuttlecockCost = used * roundedPricePerCock;
    const totalCourtCost = hourlyCourtFee * totalHours;
    const totalSessionCost = totalShuttlecockCost + totalCourtCost;
    const costPerPlayer = totalSessionCost / totalPlayers;

    return {
      shuttlecockTubePrice,
      autoPricePerCock,
      roundedPricePerCock,
      used,
      hourlyCourtFee,
      totalHours,
      totalPlayers,
      totalShuttlecockCost,
      totalCourtCost,
      totalSessionCost,
      costPerPlayer,
    };
  }, [
    tubePrice,
    roundedPrice,
    usedShuttlecocks,
    courtFeePerHour,
    hoursPlayed,
    players,
  ]);

  function persist(nextHistory: SessionRecord[]) {
    setHistory(nextHistory);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  }

  function saveSession() {
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      shuttlecockTubePrice: calculations.shuttlecockTubePrice,
      autoPricePerCock: calculations.autoPricePerCock,
      roundedPricePerCock: calculations.roundedPricePerCock,
      usedShuttlecocks: calculations.used,
      courtFeePerHour: calculations.hourlyCourtFee,
      hoursPlayed: calculations.totalHours,
      players: calculations.totalPlayers,
      totalCourtCost: calculations.totalCourtCost,
      totalShuttlecockCost: calculations.totalShuttlecockCost,
      totalSessionCost: calculations.totalSessionCost,
      costPerPlayer: calculations.costPerPlayer,
    };

    persist([record, ...history]);
  }

  function deleteSession(id: string) {
    persist(history.filter((entry) => entry.id !== id));
  }

  function clearHistory() {
    persist([]);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-5">
      <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_70%)]" />
        <div className="relative">
          <div className="inline-flex items-center rounded-full border border-orange-400/25 bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
            Badminton PWA
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Kockulator PT-PT
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
            Hitung patungan lapangan dan kok dengan angka besar, kontras tinggi,
            dan gampang dibaca di tengah hall.
          </p>
        </div>
      </section>

      <section className="mt-5 grid gap-4">
        <Field
          label="Harga 1 slop"
          hint="1 slop = 12 shuttlecock"
          icon={<Feather className="size-5" />}
          value={tubePrice}
          onChange={(value) => setTubePrice(formatIntegerInput(value))}
          type="text"
          inputMode="numeric"
        />
        <div className="rounded-[28px] border border-white/10 bg-linear-to-br from-white/[0.07] to-white/4 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
          <p className="text-sm font-semibold text-white">
            Harga per kok otomatis
          </p>
          <p className="mt-2 text-3xl font-black text-orange-300">
            {formatCurrency(calculations.autoPricePerCock)}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/50">
            Rumus: harga slop / 12. Kamu bisa override di field bawah kalau
            ingin dibulatkan manual.
          </p>
        </div>
        <Field
          label="Harga per kok dibulatkan"
          hint="Kosongkan atau isi 0 untuk pakai harga otomatis"
          icon={<Wallet className="size-5" />}
          value={roundedPrice}
          onChange={(value) => setRoundedPrice(formatIntegerInput(value))}
          type="text"
          inputMode="numeric"
        />
        <Field
          label="Jumlah kok terpakai"
          hint="Dipakai untuk menghitung total biaya shuttlecock"
          icon={<Feather className="size-5" />}
          value={usedShuttlecocks}
          onChange={setUsedShuttlecocks}
        />
        <Field
          label="Biaya lapangan per jam"
          hint="Masukkan tarif sewa per jam"
          icon={<Building2 className="size-5" />}
          value={courtFeePerHour}
          onChange={(value) => setCourtFeePerHour(formatIntegerInput(value))}
          type="text"
          inputMode="numeric"
        />
        <Field
          label="Total jam main"
          hint="Mendukung angka desimal bila perlu"
          icon={<Clock3 className="size-5" />}
          value={hoursPlayed}
          onChange={setHoursPlayed}
          step="0.5"
        />
        <Field
          label="Jumlah pemain"
          hint="Biaya total akan dibagi rata"
          icon={<Users className="size-5" />}
          value={players}
          onChange={setPlayers}
        />
      </section>

      <section className="mt-5 rounded-4xl border border-orange-400/20 bg-[linear-gradient(180deg,rgba(249,115,22,0.18),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200/85">
              Real-time Result
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {formatCurrency(calculations.costPerPlayer)}
            </p>
            <p className="mt-2 text-sm text-white/70">Per pemain</p>
          </div>
          <button
            type="button"
            onClick={saveSession}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-neutral-950 shadow-[0_12px_30px_rgba(255,255,255,0.15)] transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="size-4" />
            Save Session
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-[28px] border border-white/10 bg-black/30 p-4">
          <SummaryRow
            label="Biaya kok"
            value={`${formatNumber(calculations.used)} x ${formatCurrency(calculations.roundedPricePerCock)}`}
            total={formatCurrency(calculations.totalShuttlecockCost)}
          />
          <SummaryRow
            label="Biaya lapangan"
            value={`${formatCurrency(calculations.hourlyCourtFee)} x ${formatNumber(calculations.totalHours)} jam`}
            total={formatCurrency(calculations.totalCourtCost)}
          />
          <SummaryRow
            label="Total sesi"
            value={`${formatNumber(calculations.totalPlayers)} pemain`}
            total={formatCurrency(calculations.totalSessionCost)}
            strong
          />
        </div>
      </section>

      <section className="mt-5 rounded-4xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-white/8 p-2 text-orange-300">
              <History className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">History</h2>
              <p className="text-sm text-white/[0.55]">
                Tersimpan lokal di device ini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearHistory}
            disabled={history.length === 0}
            className="text-sm font-semibold text-red-300 transition disabled:cursor-not-allowed disabled:text-white/25"
          >
            Clear All
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {!isMounted ? (
            <div className="rounded-3xl border border-dashed border-white/12 bg-black/20 p-4 text-sm leading-6 text-white/50">
              Memuat riwayat sesi...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/12 bg-black/20 p-4 text-sm leading-6 text-white/50">
              Belum ada sesi tersimpan. Simpan kalkulasi pertama untuk melihat
              riwayat dan detailnya di sini.
            </div>
          ) : (
            history.map((entry) => {
              return (
                <div
                  key={entry.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left transition"
                >
                  <div className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Jakarta",
                          }).format(new Date(entry.savedAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-orange-300">
                          {formatCurrency(entry.totalSessionCost)}
                        </p>
                        <p className="text-xs text-white/45">total biaya</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Link
                      href={`/history/${entry.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200"
                    >
                      <ExternalLink className="size-3.5" />
                      Lihat detail
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteSession(entry.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <footer className="mt-6 pb-4 text-center text-xs uppercase tracking-[0.2em] text-white/40">
        Created by dandi setiyawan
      </footer>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  total,
  strong = false,
}: {
  label: string;
  value: string;
  total: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p
          className={`text-sm ${strong ? "font-bold text-white" : "text-white/70"}`}
        >
          {label}
        </p>
        <p className="text-xs text-white/45">{value}</p>
      </div>
      <p
        className={`text-right ${strong ? "text-xl font-black text-white" : "text-base font-bold text-orange-200"}`}
      >
        {total}
      </p>
    </div>
  );
}
