# Kockulator PT-PT

Kockulator PT-PT adalah Progressive Web App (PWA) mobile-first untuk menghitung patungan badminton: biaya shuttlecock, sewa lapangan, total sesi, biaya per pemain, dan dapat share ke whatsapp.

Project ini dibuat dengan Next.js App Router, Tailwind CSS, dan `localStorage` untuk menyimpan riwayat sesi di device pengguna.

## Fitur

- Hitung harga per shuttlecock otomatis dari harga 1 slop (`1 slop = 12 pcs`)
- Override manual harga per shuttlecock dengan nilai pembulatan
- Input nominal dengan format ribuan Indonesia seperti `20.000`
- Kalkulasi real-time untuk:
  - total biaya kok
  - total biaya lapangan
  - total sesi
  - biaya per pemain
- Simpan riwayat sesi ke `localStorage`
- List history ringkas di halaman utama
- Halaman detail terpisah untuk setiap history
- PWA manifest dan service worker untuk instalasi di Android/iOS

## Stack

- Next.js 15
- React 19
- Tailwind CSS 4
- Lucide React

## Menjalankan Project

Pastikan Node.js sudah terpasang, lalu jalankan:

```bash
npm install
npm run dev
```

App akan berjalan di [http://localhost:3000](http://localhost:3000).

## Build Production

```bash
npm run build
npm run start
```

## Struktur Penting

- [app/page.tsx](/Users/dandisetiyawan/pribadi/Kockulator/app/page.tsx): halaman utama kalkulator
- [components/ptpt-calculator.tsx](/Users/dandisetiyawan/pribadi/Kockulator/components/ptpt-calculator.tsx): UI kalkulator, kalkulasi, dan history
- [app/history/[id]/page.tsx](/Users/dandisetiyawan/pribadi/Kockulator/app/history/[id]/page.tsx): route detail history
- [components/history-detail.tsx](/Users/dandisetiyawan/pribadi/Kockulator/components/history-detail.tsx): tampilan detail sesi
- [app/manifest.ts](/Users/dandisetiyawan/pribadi/Kockulator/app/manifest.ts): konfigurasi manifest PWA
- [public/sw.js](/Users/dandisetiyawan/pribadi/Kockulator/public/sw.js): service worker
- [components/pwa-register.tsx](/Users/dandisetiyawan/pribadi/Kockulator/components/pwa-register.tsx): registrasi service worker

## Cara Pakai

1. Isi harga 1 slop.
2. Cek harga per kok otomatis.
3. Jika perlu, isi harga per kok hasil pembulatan manual.
4. Isi jumlah kok terpakai.
5. Isi biaya lapangan per jam dan total jam main.
6. Isi jumlah pemain.
7. Hasil patungan per pemain akan muncul otomatis.
8. Tekan `Save Session` untuk menyimpan riwayat.
9. Buka detail history dari tombol `Lihat detail`.

## Contoh Validasi

Contoh skenario:

- Harga 1 slop: `135.000`
- Harga otomatis per kok: `11.250`
- Harga bulat manual: `13.000`
- Biaya lapangan: `45.000/jam`
- Lama main: `2 jam`
- Kok terpakai: `6`
- Jumlah pemain: `12`

Hasil:

- Biaya kok: `78.000`
- Biaya lapangan: `90.000`
- Total sesi: `168.000`
- Patungan per pemain: `14.000`

## Penyimpanan Data

Riwayat sesi disimpan di browser menggunakan `localStorage` dengan key:

```txt
kockulator-session-history
```

Data hanya tersimpan di device/browser yang sama dan tidak tersinkron ke server.

## Catatan PWA

- App bisa di-install ke home screen
- Service worker melakukan cache dasar untuk app shell
- Jika ada perubahan service worker dan browser masih memakai versi lama:
  1. buka DevTools
  2. masuk ke tab Application
  3. pilih Service Workers
  4. klik `Unregister`
  5. refresh aplikasi

## Kredit

Created by dandi setiyawan
