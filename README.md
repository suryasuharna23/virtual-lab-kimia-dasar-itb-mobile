# 🧪 Lab Kimia Dasar ITB

Aplikasi mobile resmi untuk menunjang kegiatan praktikum Kimia Dasar di **Institut Teknologi Bandung**. Membantu mahasiswa mengakses materi praktikum, jadwal, pengumuman, dan simulasi laboratorium virtual.

## 📱 Tentang Aplikasi

Aplikasi **Lab Kimia Dasar ITB** dirancang untuk mendigitalkan pengalaman praktikum mahasiswa. Mulai dari pengecekan jadwal hingga pengerjaan modul di laboratorium virtual, aplikasi ini menjadi pusat informasi dan interaksi bagi praktikan dan asisten laboratorium.

## ✨ Fitur Utama

1.  **🏠 Home** - Dashboard utama yang menyajikan ringkasan informasi praktikum terbaru.
2.  **🧪 Praktikum** - Akses ke daftar modul praktikum, panduan langkah-demi-langkah, dan materi terkait.
3.  **🎮 Virtual Lab** - Simulasi interaktif untuk berlatih prosedur laboratorium secara virtual sebelum praktik langsung.
4.  **📢 Pengumuman** - Notifikasi push dan daftar pengumuman penting mengenai jadwal dan pengumuman laboratorium.
5.  **👤 Profile** - Informasi akun mahasiswa beserta fitur Nametag digital untuk identitas praktikan.
6.  **🔐 Admin Panel** - Panel kendali khusus asisten dan admin untuk manajemen grup dan modul.
7.  **🔑 Auth** - Sistem autentikasi aman untuk mahasiswa (praktikan) dan staf (admin/asisten).
8.  **📥 Offline Files** - Fitur pengunduhan modul untuk akses tanpa koneksi internet di dalam area laboratorium.
9.  **❓ FAQ & Kontak** - Pusat informasi bantuan dan saluran komunikasi dengan pengelola lab.
10. **📄 PDF Viewer** - Fitur pembaca dokumen PDF terintegrasi untuk kenyamanan membaca modul di perangkat mobile.

## 🖼 Screenshots

*(Bagian ini adalah placeholder untuk dokumentasi visual aplikasi)*

---

## 📥 Instalasi

### A. Download Build (Cara Tercepat)
File instalasi siap pakai tersedia di dalam folder `builds/`:
- **iOS**: `LabKimiaDasarITB.ipa` (12 MB)
- **Android**: `LabKimiaDasarITB.apk` (91 MB)

*Build terakhir: 3 Januari 2026*

> **📝 Catatan**: File build (`.apk` dan `.ipa`) tidak di-commit ke Git karena ukurannya besar. Jika folder `builds/` kosong, build ulang dari source atau minta file dari maintainer.

### B. Install di iOS
Metode instalasi untuk perangkat iOS:

- **Metode Sideloadly (Direkomendasikan untuk non-jailbroken)**:
  1. Unduh Sideloadly di [sideloadly.io](https://sideloadly.io/).
  2. Hubungkan iPhone ke Mac/PC via USB.
  3. Seret file `.ipa` ke jendela Sideloadly.
  4. Masukkan Apple ID Anda.
  5. Klik **Start**.
  6. Di iPhone: Buka **Settings > General > VPN & Device Management**, percayai (*Trust*) profil pengembang Anda.

- **Metode AltStore**:
  1. Instal AltServer di komputer Anda.
  2. Instal AltStore ke iPhone.
  3. Gunakan fitur "Open with AltStore" pada file `.ipa`.

- **Metode Xcode (Untuk Developer)**:
  1. Buka `ios/LabKimiaDasarITB.xcworkspace` di Xcode.
  2. Pilih target perangkat fisik.
  3. Atur *Signing & Capabilities* dengan akun developer Anda.
  4. Klik **Build and Run**.

> **⚠️ Perhatian**: Build iOS yang diinstal dengan akun Apple ID gratis akan kadaluarsa dalam **7 hari**. Anda perlu melakukan proses instalasi ulang setelah masa berlaku habis.

### C. Install di Android
- **Instalasi Langsung**:
  1. Salin file APK ke ponsel.
  2. Buka APK dan berikan izin "Install from Unknown Sources" jika diminta.
  3. Lanjutkan instalasi hingga selesai.

- **Melalui ADB**:
  ```bash
  adb install builds/LabKimiaDasarITB.apk
  ```

---

## 🔧 Development Setup

### Prasyarat
- Node.js 18+
- npm atau yarn
- Expo CLI (`npm install -g expo-cli`)
- **iOS**: macOS dengan Xcode
- **Android**: Android Studio & SDK

### Quick Start
1. **Clone repository & Install dependensi**:
   ```bash
   npm install
   ```
2. **Jalankan Expo Server**:
   ```bash
   npx expo start
   ```
3. **Buka Aplikasi**:
   - Pindai QR Code menggunakan aplikasi **Expo Go**.
   - Tekan `i` untuk iOS Simulator.
   - Tekan `a` untuk Android Emulator.

### Running Native Builds
```bash
# Menjalankan di iOS Simulator (Native)
npx expo run:ios

# Menjalankan di Android Emulator (Native)
npx expo run:android
```

---

## 📦 Membangun dari Source

### iOS Build
```bash
npx expo prebuild --platform ios
cd ios && pod install
# Buka workspace di Xcode dan lakukan build release
```

### Android Build
```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

---

## 📂 Struktur Proyek
```text
├── app/              # Expo Router (File-based Routing)
├── assets/           # Gambar, Ikon, dan Font
├── components/       # Komponen UI global (Button, Card, dll)
├── constants/        # Tema warna dan nilai konstan
├── contexts/         # React Context (Auth, Global State)
├── features/         # Logika spesifik per fitur
├── hooks/            # Custom React Hooks
├── lib/              # Konfigurasi library (API client, dll)
├── types/            # Definisi tipe TypeScript
└── builds/           # Binary (.apk & .ipa) hasil build
```

---

## 🛠 Tech Stack
- **Core**: React Native 0.81.5
- **SDK**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router & React Navigation
- **Storage**: Async Storage & Expo Secure Store
- **Networking**: Fetch API / Axios
- **UI Components**: React Native Reanimated, Bottom Sheet, SVG

## 🌐 Environment Variables
Aplikasi menggunakan backend API yang dikonfigurasi pada `app.json`:
- **API URL**: `https://backend-labkidas-rn.vercel.app`

## 🎓 Credits
**Laboratorium Kimia Dasar**  
Institut Teknologi Bandung
