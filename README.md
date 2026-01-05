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

## 📥 Instalasi

### A. Download Build (Cara Tercepat)

[![GitHub Release](https://img.shields.io/github/v/release/suryasuharna23/virtual-lab-kimia-dasar-itb-mobile?style=for-the-badge)](https://github.com/suryasuharna23/virtual-lab-kimia-dasar-itb-mobile/releases/latest)

Download dari [**GitHub Releases**](https://github.com/suryasuharna23/virtual-lab-kimia-dasar-itb-mobile/releases/latest):

| Platform | File | Size | Link | Catatan |
|----------|------|------|------|---------|
| **Android** | `LabKimiaDasarITB.apk` | 99 MB | [⬇️ Download](https://github.com/suryasuharna23/virtual-lab-kimia-dasar-itb-mobile/releases/download/v1.1.0/LabKimiaDasarITB.apk) | Siap install |
| **iOS (Signed)** | `LabKimiaDasarITB-signed.ipa` | 23 MB | [⬇️ Download](https://github.com/suryasuharna23/virtual-lab-kimia-dasar-itb-mobile/releases/download/v1.1.0-signed/LabKimiaDasarITB-signed.ipa) | ✨ **Termudah**, drag & drop ke Xcode |
| **iOS (Unsigned)** | `LabKimiaDasarITB.ipa` | 22 MB | [⬇️ Download](https://github.com/suryasuharna23/virtual-lab-kimia-dasar-itb-mobile/releases/download/v1.1.0/LabKimiaDasarITB.ipa) | Perlu Sideloadly/AltStore |

*Build terakhir: 4 Januari 2026 (v1.1.0)*

> 💡 **Rekomendasi iOS**: 
> - Punya Mac + Xcode? → Gunakan **Signed IPA** (drag & drop ke Xcode Devices)
> - Tidak punya Mac? → Gunakan **Unsigned IPA** dengan Sideloadly (Windows/Mac)

### B. Install di iOS

#### Opsi 1: Xcode Devices (Termudah - Signed IPA) ✨

**Untuk**: Mac user dengan Xcode

1. Download **LabKimiaDasarITB-signed.ipa**
2. Connect iPhone via USB
3. Xcode → **Window** → **Devices and Simulators** (⇧⌘2)
4. Pilih device kamu di sidebar
5. **Drag & drop** IPA ke bagian "Installed Apps"
6. Di iPhone: Settings → General → VPN & Device Management → **Trust**

> ⚠️ **Kadaluarsa 7 hari** - perlu reinstall setiap minggu

---

#### Opsi 2: Sideloadly (Untuk semua platform - Unsigned IPA)

**Untuk**: Windows/Mac tanpa Xcode, atau mau pakai Apple ID sendiri

1. Download **LabKimiaDasarITB.ipa** (unsigned)
2. Install Sideloadly dari [sideloadly.io](https://sideloadly.io/)
3. Connect iPhone via USB
4. Drag IPA ke Sideloadly
5. Masukkan Apple ID kamu → **Start**
6. Di iPhone: Settings → General → VPN & Device Management → **Trust**

---

#### Opsi 3: AltStore

**Untuk**: Alternatif Sideloadly

1. Download **LabKimiaDasarITB.ipa** (unsigned)
2. Install AltServer di komputer
3. Install AltStore ke iPhone via AltServer
4. Open IPA dengan AltStore

---
#### Opsi 4: Build dari Source (Developer)

**Untuk**: Developer yang mau build sendiri

1. Buka `ios/LabKimiaDasarITB.xcworkspace` di Xcode
2. Pilih device fisik di top bar
3. Signing & Capabilities → Pilih Team (Personal Team)
4. Klik **▶️ Run**

> **⚠️ Perhatian**: Build iOS yang diinstal dengan akun Apple ID gratis akan kadaluarsa dalam **7 hari**. Anda perlu melakukan proses instalasi ulang setelah masa berlaku habis.

---

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

## 🧑‍💻 Dummy Akun Testing

Gunakan akun berikut untuk login ke aplikasi selama pengujian:

**Akun Mahasiswa**
- Email: pepeng@mahasiswa.com
- Password: #Pepeng123!

**Akun Admin**
- Email: adminbaru@labkimia.itb.ac.id
- Password: AdminBaru123!

## 🎓 Credits
**Laboratorium Kimia Dasar**  
Institut Teknologi Bandung
