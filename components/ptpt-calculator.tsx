"use client";

import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Clock3,
  ExternalLink,
  Feather,
  History,
  Image as ImageIcon,
  QrCode,
  Save,
  Trash2,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { SplashScreen } from "@/components/splash-screen";
import { SiteFooter } from "@/components/site-footer";

export type SessionRecord = {
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
  qrisImage?: string;
};

const STORAGE_KEY = "kockulator-session-history";
const QRIS_IMAGE_STORAGE_KEY = "kockulator-qris-image";

// ponytail: compress and resize uploaded QRIS image for optimal localStorage base64 storage
export function processQrisImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/i)) {
      return reject(new Error("Format file harus PNG, JPG, atau JPEG."));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Gagal membaca kanvas gambar."));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("File gambar rusak atau tidak valid."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

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

function ToggleCard({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs leading-5 text-white/[0.55]">{hint}</p>
      </div>
      <span
        className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
          checked ? "bg-orange-500" : "bg-white/10"
        }`}
      >
        <span
          className={`flex size-5 items-center justify-center rounded-full bg-white text-neutral-950 transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {checked ? <Check className="size-3.5" /> : null}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
    </label>
  );
}

export function PtPtCalculator() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pricePerCock, setPricePerCock] = useState("11.250");
  const [roundedPrice, setRoundedPrice] = useState("0");
  const [usedShuttlecocks, setUsedShuttlecocks] = useState("6");
  const [isShuttlecockSponsored, setIsShuttlecockSponsored] = useState(false);
  const [courtFeePerHour, setCourtFeePerHour] = useState("45.000");
  const [hoursPlayed, setHoursPlayed] = useState("2");
  const [players, setPlayers] = useState("12");
  const [isPerPlayerRounded, setIsPerPlayerRounded] = useState(false);
  const [history, setHistory] = useState<SessionRecord[]>([]);

  // QRIS Image State
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const splashTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1200);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionRecord[];
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const savedImage = window.localStorage.getItem(QRIS_IMAGE_STORAGE_KEY);
    if (savedImage) {
      setQrisImage(savedImage);
    }

    return () => {
      window.clearTimeout(splashTimer);
    };
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const dataUrl = await processQrisImageFile(file);
      setQrisImage(dataUrl);
      window.localStorage.setItem(QRIS_IMAGE_STORAGE_KEY, dataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah QRIS.";
      setUploadError(msg);
    }
  }

  function deleteQrisImage() {
    setQrisImage(null);
    window.localStorage.removeItem(QRIS_IMAGE_STORAGE_KEY);
  }

  const calculations = useMemo(() => {
    const autoPricePerCock = toSafeNumber(pricePerCock);
    const shuttlecockTubePrice = autoPricePerCock * 12;
    const halfTubePrice = autoPricePerCock * 6;
    const manualRoundedPrice = toSafeNumber(roundedPrice);
    const roundedPricePerCock =
      manualRoundedPrice > 0 ? manualRoundedPrice : autoPricePerCock;
    const used = toSafeNumber(usedShuttlecocks);
    const hourlyCourtFee = toSafeNumber(courtFeePerHour);
    const totalHours = toSafeNumber(hoursPlayed);
    const totalPlayers = Math.max(toSafeNumber(players), 1);
    const totalShuttlecockCost = isShuttlecockSponsored
      ? 0
      : used * roundedPricePerCock;
    const totalCourtCost = hourlyCourtFee * totalHours;
    const totalSessionCost = totalShuttlecockCost + totalCourtCost;
    const baseCostPerPlayer = totalSessionCost / totalPlayers;
    const costPerPlayer = isPerPlayerRounded
      ? Math.ceil(baseCostPerPlayer / 1000) * 1000
      : baseCostPerPlayer;

    return {
      shuttlecockTubePrice,
      halfTubePrice,
      autoPricePerCock,
      roundedPricePerCock,
      used,
      isShuttlecockSponsored,
      hourlyCourtFee,
      totalHours,
      totalPlayers,
      isPerPlayerRounded,
      baseCostPerPlayer,
      totalShuttlecockCost,
      totalCourtCost,
      totalSessionCost,
      costPerPlayer,
    };
  }, [
    pricePerCock,
    roundedPrice,
    usedShuttlecocks,
    isShuttlecockSponsored,
    courtFeePerHour,
    hoursPlayed,
    players,
    isPerPlayerRounded,
  ]);

  function persist(nextHistory: SessionRecord[]) {
    setHistory(nextHistory);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  }

function generateSafeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

  function saveSession() {
    const record: SessionRecord = {
      id: generateSafeId(),
      savedAt: new Date().toISOString(),
      shuttlecockTubePrice: calculations.shuttlecockTubePrice,
      autoPricePerCock: calculations.autoPricePerCock,
      roundedPricePerCock: calculations.roundedPricePerCock,
      usedShuttlecocks: calculations.used,
      isShuttlecockSponsored: calculations.isShuttlecockSponsored,
      courtFeePerHour: calculations.hourlyCourtFee,
      hoursPlayed: calculations.totalHours,
      players: calculations.totalPlayers,
      isPerPlayerRounded: calculations.isPerPlayerRounded,
      baseCostPerPlayer: calculations.baseCostPerPlayer,
      totalCourtCost: calculations.totalCourtCost,
      totalShuttlecockCost: calculations.totalShuttlecockCost,
      totalSessionCost: calculations.totalSessionCost,
      costPerPlayer: calculations.costPerPlayer,
      qrisImage: qrisImage ?? undefined,
    };

    persist([record, ...history]);
  }

  function deleteSession(id: string) {
    persist(history.filter((entry) => entry.id !== id));
  }

  function clearHistory() {
    persist([]);
  }

  if (!isMounted) {
    return <SplashScreen label="Menyiapkan kalkulator patungan badminton..." />;
  }

  return (
    <>
      {showSplash || isNavigating ? (
        <SplashScreen
          label={
            isNavigating
              ? "Membuka detail sesi badminton..."
              : "Menyiapkan kalkulator patungan badminton..."
          }
        />
      ) : null}

      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-5">
        <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_70%)]" />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-orange-400/25 bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
              Badminton
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
              Kockulator PT-PT
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
              Buat ngitung patungan sesi badminton biar adil dan transparan.
            </p>
          </div>
        </section>

        <section className="mt-5 grid gap-4">
          <Field
            label="Harga per kok"
            hint="Harga 1 shuttlecock"
            icon={<Feather className="size-5" />}
            value={pricePerCock}
            onChange={(value) => setPricePerCock(formatIntegerInput(value))}
            type="text"
            inputMode="numeric"
          />
          <div className="rounded-[28px] border border-white/10 bg-linear-to-br from-white/[0.07] to-white/4 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
            <p className="text-sm font-semibold text-white">
              Harga slop otomatis
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs font-semibold text-white/60">12 kok (1 slop)</p>
                <p className="mt-1 text-xl font-black text-orange-300">
                  {formatCurrency(calculations.shuttlecockTubePrice)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs font-semibold text-white/60">6 kok (½ slop)</p>
                <p className="mt-1 text-xl font-black text-orange-300">
                  {formatCurrency(calculations.halfTubePrice)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/50">
              Rumus: harga per kok x 12 dan x 6. Kamu bisa override harga per
              kok di field bawah kalau ingin dibulatkan manual.
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
          <ToggleCard
            label="Kok dibayarin"
            hint="Jika dicentang, biaya shuttlecock dianggap Rp0 dan tidak ikut masuk total sesi."
            checked={isShuttlecockSponsored}
            onChange={setIsShuttlecockSponsored}
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
          <ToggleCard
            label="Bulatkan total per orang"
            hint="Jika dicentang, hasil patungan dibulatkan ke atas ke kelipatan Rp1.000."
            checked={isPerPlayerRounded}
            onChange={setIsPerPlayerRounded}
          />

          {/* QRIS Upload Component */}
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-3">
              <span className="rounded-2xl bg-orange-500/15 p-2 text-orange-300">
                <QrCode className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">QRIS Pembayaran</p>
                <p className="text-xs leading-5 text-white/[0.55]">
                  Unggah gambar QRIS kamu (PNG, JPG, JPEG) untuk ditempelkan pada invoice patungan.
                </p>
              </div>
            </div>

            {uploadError ? (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            ) : null}

            {qrisImage ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="overflow-hidden rounded-xl bg-white p-2 shadow-md">
                  <img
                    src={qrisImage}
                    alt="QRIS Pembayaran"
                    className="size-44 object-contain"
                  />
                </div>
                <p className="text-xs text-white/70">Gambar QRIS tersimpan di browser ini</p>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15">
                    <Upload className="size-3.5" />
                    <span>Ganti Gambar</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={deleteQrisImage}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/20 p-5 text-center">
                <ImageIcon className="size-8 text-white/30" />
                <p className="text-xs leading-5 text-white/60">
                  Belum ada QRIS. Unggah gambar QRIS kamu agar teman-teman tinggal scan saat bayar.
                </p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]">
                  <Upload className="size-4" />
                  <span>Unggah Gambar QRIS</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>
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
              value={
                calculations.isShuttlecockSponsored
                  ? "Dibayarin"
                  : `${formatNumber(calculations.used)} x ${formatCurrency(calculations.roundedPricePerCock)}`
              }
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
            <SummaryRow
              label="Patungan per orang"
              value={
                calculations.isPerPlayerRounded
                  ? `Base ${formatCurrency(calculations.baseCostPerPlayer)} dibulatkan`
                  : "Tanpa pembulatan"
              }
              total={formatCurrency(calculations.costPerPlayer)}
            />
          </div>

          {/* QRIS Image Section in Result */}
          {qrisImage ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-[28px] border border-orange-400/30 bg-black/40 p-5 text-center">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-300">
                <QrCode className="size-4" />
                <span>QRIS Pembayaran Patungan</span>
              </div>
              
              <div className="mt-3 overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
                <img
                  src={qrisImage}
                  alt="QRIS Pembayaran"
                  className="size-48 object-contain"
                />
              </div>

              <p className="mt-2 text-xs font-semibold text-orange-200">
                Scan QRIS di atas untuk bayar: {formatCurrency(calculations.costPerPlayer)} / orang
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-orange-400/30 bg-black/30 p-4 text-center">
              <p className="text-xs text-orange-200/80">
                Belum ada gambar QRIS yang diunggah. Unggah QRIS pada form di atas sebelum menyimpan atau membagikan invoice.
              </p>
            </div>
          )}
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
                        onClick={() => setIsNavigating(true)}
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

        <SiteFooter />
      </main>
    </>
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
