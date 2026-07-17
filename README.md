# Fulus - Aplikasi Manajemen Keuangan & Dompet Digital

Fulus adalah aplikasi web berbasis React untuk memonitor keuangan, melacak transaksi, mengatur anggaran (budget), serta mengelola aset. Aplikasi ini dilengkapi dengan "Pro Mode" yang diamankan oleh PIN untuk mengakses fitur-fitur lanjutan seperti analisis AI dan manajemen portofolio aset.

## 🚀 Kelebihan Website Ini
- **Antarmuka Modern & Responsif:** Desain UI/UX yang bersih (clean) dan responsif menggunakan Tailwind CSS, meniru pengalaman aplikasi mobile (Mobile-First approach).
- **Pro Mode (Fitur Eksklusif):** Terdapat mode profesional yang tersembunyi dan hanya bisa diakses menggunakan PIN rahasia untuk membuka fitur AI dan Aset tingkat lanjut.
- **Navigasi Intuitif:** Menggunakan sistem *Bottom Navigation* yang memudahkan pengguna untuk berpindah antar halaman (Home, Wallet, Scan, Transactions, Budget).
- **Performa Cepat:** Dibangun menggunakan Vite dan React (versi 19) yang memberikan waktu *load* dan *hot-reloading* yang sangat cepat.
- **Ringan & Minimalis:** Tidak menggunakan banyak *library* berat, hanya bergantung pada ekosistem React standar dan Lucide React untuk ikon.

## 📖 Guidelines (Panduan Pengembangan Lokal)

Untuk menjalankan proyek ini di mesin lokal, ikuti langkah-langkah berikut:

### Prasyarat
- Node.js (direkomendasikan versi 18 atau ke atas)
- npm atau yarn

### Instalasi & Menjalankan Aplikasi
1. **Clone repositori ini:**
   ```bash
   git clone <url-repo-anda>
   cd fulus
   ```
2. **Instal dependensi:**
   ```bash
   npm install
   ```
3. **Jalankan server pengembangan (Development Server):**
   ```bash
   npm run dev
   ```
4. Buka browser dan akses `http://localhost:5173` (atau port yang diberikan oleh Vite).

### Build untuk Produksi
```bash
npm run build
```
Hasil build akan berada di dalam folder `dist/`.

## 🔄 Detail Workflow

Alur penggunaan aplikasi didesain agar mudah dimengerti seperti aplikasi dompet digital pada umumnya:
1. **Beranda (Home):** Saat pengguna pertama kali membuka aplikasi, halaman `Home` akan ditampilkan. Menampilkan ringkasan saldo dan tombol aksi cepat.
2. **Navigasi Menu:** Pengguna dapat berpindah halaman menggunakan ikon di menu bawah (*BottomNav*):
   - **Wallet:** Mengelola berbagai metode pembayaran atau dompet yang dimiliki.
   - **Scan:** Fitur pemindai untuk pembayaran cepat (seperti QRIS).
   - **Transactions:** Melihat riwayat pengeluaran dan pemasukan.
   - **Budget:** Merencanakan dan melacak anggaran bulanan.
3. **Aktivasi Pro Mode:** 
   - Pengguna menekan tombol "Unlock" atau "Gembok" di bagian Header.
   - Sebuah modal PIN akan muncul.
   - Pengguna memasukkan 6 digit PIN (PIN Demo: `123456`).
   - Jika berhasil, UI akan menyesuaikan dan fitur-fitur tingkat lanjut (AI & Aset) akan terbuka. Jika salah, sistem akan menampilkan peringatan "PIN Salah".

## 🔒 Keamanan

- **Sistem PIN untuk Fitur Pro:** Akses ke fitur sensitif/Pro dibatasi oleh *passcode* 6 digit untuk mencegah akses yang tidak disengaja atau tidak sah saat device sedang tidak terkunci.
- **Client-Side Validation:** Validasi PIN dilakukan secara langsung dan responsif (menggunakan *state* React). 
- *(Catatan: Saat ini validasi PIN (mock: 123456) dijalankan di sisi klien/frontend. Untuk skala produksi sungguhan, validasi dan otentikasi disarankan menggunakan sistem backend atau JWT).*
- **Environment Variables:** Siap mendukung `.env` untuk menyimpan konfigurasi rahasia saat integrasi dengan backend di masa mendatang.
