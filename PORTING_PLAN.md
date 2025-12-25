# Rencana Porting Web App Lab Kimia Dasar ITB ke React Native

> **Last Updated:** 24 Desember 2025
> **Status:** Planning Complete - Ready for Implementation

---

## Ringkasan Proyek

**Tujuan**: Porting web app Lab Kimia Dasar dari Next.js ke React Native (Expo) dengan fitur lengkap untuk mobile, termasuk fitur baru seperti mahasiswa login, push notifications, offline support, dan dark mode.

**Sumber Kode**:
- Frontend Web: `../../frontend/` (Next.js 15 + Tailwind CSS)
- Backend: `../../backend/` (Express.js + Supabase)
- Target Mobile: `./` (Expo Router + React Native)

---

## Keputusan Arsitektur

### 1. Navigation Structure

**Mobile-style Bottom Tabs** (bukan copy web hamburger menu):

```
┌─────────────────────────────────────────┐
│           App Content Area              │
├─────────────────────────────────────────┤
│ 🏠    📚      🧪      📢      ⋯        │
│Home  Modul   Lab    News   Lainnya     │
└─────────────────────────────────────────┘
```

**Tab "Lainnya"** berisi:
- About
- FAQ
- Kontak
- Search
- Admin Login (hidden, di bawah)

### 2. Admin Dashboard

**Opsi C: Same App, Hidden Admin dengan Drawer Navigation**

```
app/
├── (tabs)/              # Public tabs untuk user
│   ├── _layout.tsx      # Tab navigation
│   ├── index.tsx        # Home
│   ├── praktikum.tsx    # Praktikum
│   ├── virtual-lab.tsx  # Virtual Lab
│   └── pengumuman.tsx   # Pengumuman list
│
├── (admin)/             # Admin area (hidden, drawer nav)
│   ├── _layout.tsx      # Drawer navigation layout
│   ├── login.tsx        # Admin login
│   ├── index.tsx        # Dashboard home
│   └── ...              # CRUD pages
```

### 3. Backend Strategy

**Extend Backend yang Ada** (tidak terpisah):
- Satu codebase, satu deployment
- Web + Mobile pakai backend yang sama
- Tambah endpoints untuk student auth + push notifications

### 4. Virtual Lab Data

**Bundle in App** (Option A):
- 12 practicums di-bundle sebagai static data
- Works 100% offline
- No backend endpoint needed

---

## Tech Stack

### React Native App (Expo SDK 54)

#### Core (Already Installed)
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.30 | Framework |
| `expo-router` | ~6.0.21 | File-based routing |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Native runtime |
| `react-native-reanimated` | ~4.1.1 | Animations |
| `react-native-gesture-handler` | ~2.28.0 | Touch gestures |
| `@expo/vector-icons` | ^15.0.3 | Icons |
| `expo-haptics` | ~15.0.8 | Haptic feedback |

#### To Install - Essential
| Package | Purpose |
|---------|---------|
| `@react-native-async-storage/async-storage` | Local storage, cache |
| `react-native-svg` | SVG rendering (Virtual Lab) |
| `expo-notifications` | Push + local notifications |
| `expo-file-system` | File download/save |
| `expo-sharing` | Share files |
| `expo-document-picker` | File upload (admin) |
| `@react-native-community/netinfo` | Offline detection |
| `expo-secure-store` | Secure token storage |

#### To Install - UI/UX
| Package | Purpose |
|---------|---------|
| `expo-linear-gradient` | Gradients |
| `react-native-pdf` | PDF viewer |
| `@gorhom/bottom-sheet` | Bottom sheets |
| `react-native-toast-message` | Toast notifications |

#### To Install - Dev/Testing
| Package | Purpose |
|---------|---------|
| `jest-expo` | Expo Jest preset |
| `@testing-library/react-native` | Component testing |
| `@testing-library/jest-native` | Jest matchers |
| `msw` | API mocking |
| `prettier` | Code formatting |
| `eslint-plugin-prettier` | ESLint + Prettier |

### Backend (Extend Existing)

#### To Install - New Features
| Package | Purpose |
|---------|---------|
| `expo-server-sdk` | Send push notifications |
| `zod` | Schema validation |

---

## Fitur Lengkap

### Fitur dari Web (Port)

| Fitur | Public | Admin | Notes |
|-------|--------|-------|-------|
| Home | ✅ | - | Slider, quick access, latest news |
| Pengumuman | ✅ List + Detail | ✅ CRUD | Attachments support |
| Praktikum | ✅ | - | Modules, jadwal, kelompok |
| Virtual Lab | ✅ 12 simulations | - | Interactive chemistry |
| About/FAQ/Kontak | ✅ | - | Static + contact form |
| Search | ✅ | - | Global search |
| Nilai | ✅ (password) | ✅ CRUD | Grade files per class |
| Files | ✅ (password optional) | ✅ CRUD | General files |
| Modules | ✅ Download | ✅ CRUD | Practicum modules |
| Groups | ✅ Download | ✅ CRUD | Group assignments |
| Sliders | - | ✅ CRUD | Hero images |
| Messages | - | ✅ Read | Contact submissions |

### Fitur Baru (Mobile-specific)

| Fitur | Description | Priority |
|-------|-------------|----------|
| **Mahasiswa Login** | Email + password via Supabase Auth | High |
| **Push Notifications** | Pengumuman baru, nilai released | High |
| **Offline Support** | Cache announcements, modules, downloaded files | High |
| **Dark Mode** | System preference + manual toggle | Medium |
| **Praktikum Reminder** | Local notification 1 day before | Medium |
| **File Preview + Save** | View PDF inline, option to save offline | High |

---

## Pembagian Tugas

### Tim Arqila: Foundation, Public Features & Backend

**Fokus**: Setup foundation, UI components, halaman publik, dan backend extensions

#### Fase 1: Foundation Setup (3-4 hari)

- [ ] **Project Structure**
  ```
  app/
  components/
  ├── ui/
  ├── shared/
  ├── VirtualLab/
  └── layout/
  contexts/
  lib/
  constants/
  hooks/
  types/
  __tests__/
  ```

- [ ] **Install Dependencies**
  ```bash
  # Essential
  npx expo install @react-native-async-storage/async-storage react-native-svg expo-notifications expo-file-system expo-sharing expo-document-picker @react-native-community/netinfo expo-secure-store

  # UI/UX
  npx expo install expo-linear-gradient
  npm install react-native-pdf @gorhom/bottom-sheet react-native-toast-message

  # Dev/Testing
  npm install -D jest-expo @testing-library/react-native @testing-library/jest-native msw prettier eslint-plugin-prettier eslint-config-prettier
  ```

- [ ] **TypeScript Config** (strict mode)
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true
    }
  }
  ```

- [ ] **Prettier + ESLint Config**
  ```json
  // .prettierrc
  {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  }
  ```

- [ ] **Jest Config**
  ```json
  // jest.config.js
  {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["@testing-library/react-native/extend-expect"]
  }
  ```

- [ ] **Theme Constants** (`constants/theme.ts`)
  - Colors (light/dark)
  - Typography
  - Spacing
  - Shadows

- [ ] **API Layer** (`lib/api.ts`)
  - Port dari web
  - Ganti localStorage → expo-secure-store
  - Environment config untuk API URL
  - Type-safe dengan TypeScript

- [ ] **Types** (`types/index.ts`)
  - Port semua types dari web
  - Add new types untuk mobile features

- [ ] **Contexts**
  - `AppContext.tsx` - Notifications, global state
  - `AuthContext.tsx` - Auth state, user info
  - `ThemeContext.tsx` - Dark mode

#### Fase 2: Core UI Components (3-4 hari)

Semua components harus:
- TypeScript strict
- Tested dengan React Native Testing Library
- Support dark mode
- Formatted dengan Prettier

- [ ] **UI Components** (`components/ui/`)
  - `Button.tsx` + `Button.test.tsx`
  - `Card.tsx` + `Card.test.tsx`
  - `Badge.tsx` + `Badge.test.tsx`
  - `LoadingSpinner.tsx`
  - `Modal.tsx`
  - `Input.tsx`
  - `Text.tsx` (themed)

- [ ] **Shared Components** (`components/shared/`)
  - `SearchBar.tsx`
  - `QuickAccess.tsx`
  - `LatestAnnouncements.tsx`
  - `PasswordModal.tsx`
  - `FilePreview.tsx`
  - `Toast.tsx` (wrapper untuk react-native-toast-message)

#### Fase 3: Backend Extensions (2-3 hari)

- [ ] **New Dependencies**
  ```bash
  cd ../../backend
  npm install expo-server-sdk zod
  ```

- [ ] **Database: New Tables** (Supabase)
  ```sql
  -- Students table (or use Supabase Auth)
  CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    nim TEXT UNIQUE,
    cohort TEXT,
    faculty TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Push tokens
  CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT CHECK (user_type IN ('admin', 'student')),
    push_token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, push_token)
  );
  ```

- [ ] **New Routes**
  - `routes/students.js` - Student registration/login
  - `routes/devices.js` - Push token management

- [ ] **New Lib**
  - `lib/push.js` - Expo Push Service helper

- [ ] **Modify Existing Routes**
  - `routes/announcements.js` → trigger push after create
  - `routes/nilai.js` → trigger push after create

- [ ] **API Endpoints Summary**
  ```
  # Existing (no change)
  POST   /api/auth/login              # Admin login
  GET    /api/auth/me                 # Get current user
  ...all existing endpoints...

  # New for Mobile
  POST   /api/auth/student/register   # Student registration
  POST   /api/auth/student/login      # Student login
  GET    /api/auth/student/me         # Get student info
  POST   /api/devices                 # Register push token
  DELETE /api/devices/:token          # Unregister push token
  ```

#### Fase 4: Public Pages (5-7 hari)

- [ ] **Tab Navigation** (`app/(tabs)/_layout.tsx`)
  - 5 tabs: Home, Praktikum, Virtual Lab, Pengumuman, Lainnya
  - Dark mode support

- [ ] **Home Page** (`app/(tabs)/index.tsx`)
  - Hero section dengan slider
  - Quick access grid
  - Latest announcements
  - API integration

- [ ] **Praktikum Page** (`app/(tabs)/praktikum.tsx`)
  - Stats cards dengan CountUp
  - Modules list dengan download
  - Schedule (horizontal scroll table)
  - Groups section
  - **Reminder button** untuk set local notification

- [ ] **Pengumuman Pages**
  - `app/(tabs)/pengumuman.tsx` - List
  - `app/pengumuman/[id].tsx` - Detail
  - Pagination
  - Pull to refresh
  - Offline cache

- [ ] **More/Lainnya Page** (`app/(tabs)/more.tsx`)
  - Menu list ke: About, FAQ, Kontak, Search
  - Admin Login button (subtle, di bawah)
  - App version info

- [ ] **Secondary Pages**
  - `app/about.tsx`
  - `app/faq.tsx` - Collapsible accordion
  - `app/kontak.tsx` - Contact form + map
  - `app/search.tsx` - Global search

#### Fase 5: Auth & Notifications (3-4 hari)

- [ ] **Student Auth Flow**
  - Login screen
  - Register screen
  - Forgot password
  - Token management dengan expo-secure-store

- [ ] **Push Notification Setup**
  - Permission request
  - Token registration ke backend
  - Notification handlers
  - Deep linking dari notification

- [ ] **Local Notifications**
  - Praktikum reminder (1 day before)
  - Schedule management

#### Fase 6: File Handling (2-3 hari)

- [ ] **Download System**
  - Progress indicator
  - Save to device
  - Open with system viewer

- [ ] **PDF Preview**
  - Inline viewer dengan react-native-pdf
  - Share button
  - Save offline button

- [ ] **Offline Storage**
  - Track downloaded files
  - List offline files
  - Delete offline files

---

### Tim Surya: Virtual Lab & Admin Features

**Fokus**: Virtual Lab interaktif dan admin dashboard

#### Fase 1: Virtual Lab Core (5-7 hari)

- [ ] **Practicum Data** (`constants/practicums.ts`)
  - Bundle 12 practicums
  - Reagents, steps, expected results
  - Icon mapping

- [ ] **Workbench Component** (`components/VirtualLab/Workbench.tsx`)
  - SVG beaker dengan react-native-svg
  - Liquid animation dengan Reanimated
  - Bubble animations
  - Steam effect
  - Touch-based interactions

- [ ] **Toolbox Component** (`components/VirtualLab/Toolbox.tsx`)
  - Reagent buttons (tap to add)
  - Icon mapping ke @expo/vector-icons

- [ ] **Controls Component** (`components/VirtualLab/Controls.tsx`)
  - Control buttons
  - Haptic feedback
  - Loading states

- [ ] **Runner Component** (`components/VirtualLab/Runner.tsx`)
  - Simulation state management
  - pH calculation logic
  - Procedure steps
  - Result display

#### Fase 2: Virtual Lab Pages (2-3 hari)

- [ ] **Virtual Lab Tab** (`app/(tabs)/virtual-lab.tsx`)
  - Practicum cards grid
  - Difficulty badges
  - Search/filter

- [ ] **Virtual Lab Detail** (`app/virtual-lab/[id].tsx`)
  - Full simulation experience
  - Instructions
  - Runner integration

#### Fase 3: Admin Auth & Layout (2-3 hari)

- [ ] **Admin Login** (`app/(admin)/login.tsx`)
  - Email/password form
  - Error handling
  - Redirect ke dashboard

- [ ] **Admin Layout** (`app/(admin)/_layout.tsx`)
  - Drawer navigation
  - Menu items
  - Logout button
  - User info header

- [ ] **Auth Guard**
  - Protected route HOC/hook
  - Token validation
  - Auto-logout on expiry

#### Fase 4: Admin Dashboard (5-7 hari)

- [ ] **DataTable Component** (`components/shared/DataTable.tsx`)
  - FlatList-based
  - Column headers
  - Pagination
  - Search/filter
  - Row actions

- [ ] **FileUpload Component** (`components/shared/FileUpload.tsx`)
  - expo-document-picker
  - File validation
  - Upload progress
  - FormData creation

- [ ] **Admin Pages**
  - `app/(admin)/index.tsx` - Dashboard home
  - `app/(admin)/announcements.tsx` - CRUD
  - `app/(admin)/modules.tsx` - CRUD + upload
  - `app/(admin)/files.tsx` - CRUD + upload
  - `app/(admin)/groups.tsx` - CRUD
  - `app/(admin)/nilai.tsx` - CRUD + password
  - `app/(admin)/sliders.tsx` - CRUD + image
  - `app/(admin)/messages.tsx` - Read + status

---

## Struktur Folder Final

```
app/
├── (tabs)/
│   ├── _layout.tsx           # Tab navigation
│   ├── index.tsx             # Home
│   ├── praktikum.tsx         # Praktikum
│   ├── virtual-lab.tsx       # Virtual Lab list
│   ├── pengumuman.tsx        # Pengumuman list
│   └── more.tsx              # Lainnya menu
├── (admin)/
│   ├── _layout.tsx           # Drawer navigation
│   ├── login.tsx
│   ├── index.tsx             # Dashboard
│   ├── announcements.tsx
│   ├── modules.tsx
│   ├── files.tsx
│   ├── groups.tsx
│   ├── nilai.tsx
│   ├── sliders.tsx
│   └── messages.tsx
├── pengumuman/
│   └── [id].tsx              # Detail
├── virtual-lab/
│   └── [id].tsx              # Simulation
├── auth/
│   ├── login.tsx             # Student login
│   ├── register.tsx          # Student register
│   └── forgot-password.tsx
├── about.tsx
├── faq.tsx
├── kontak.tsx
├── search.tsx
├── offline-files.tsx         # Manage offline files
└── _layout.tsx               # Root layout

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   ├── LoadingSpinner.tsx
│   └── Modal.tsx
├── shared/
│   ├── SearchBar.tsx
│   ├── QuickAccess.tsx
│   ├── LatestAnnouncements.tsx
│   ├── DataTable.tsx
│   ├── FileUpload.tsx
│   ├── FilePreview.tsx
│   ├── PasswordModal.tsx
│   └── Toast.tsx
├── VirtualLab/
│   ├── Workbench.tsx
│   ├── Toolbox.tsx
│   ├── Controls.tsx
│   └── Runner.tsx
└── layout/
    ├── TabBar.tsx
    └── AdminDrawer.tsx

contexts/
├── AppContext.tsx
├── AuthContext.tsx
└── ThemeContext.tsx

lib/
├── api.ts
├── auth.ts
├── storage.ts               # AsyncStorage helpers
├── notifications.ts         # Push + local notif helpers
├── offline.ts               # Offline cache helpers
└── utils.ts

constants/
├── theme.ts
├── api.ts
├── practicums.ts            # Virtual lab data (bundled)
└── config.ts                # App config

hooks/
├── useAuth.ts
├── useTheme.ts
├── useOffline.ts
├── useNotifications.ts
└── useApi.ts

types/
├── index.ts
├── api.ts
├── navigation.ts
└── virtualLab.ts

__tests__/
├── components/
├── screens/
├── hooks/
└── utils/
```

---

## Timeline Estimasi

| Minggu | Arqila | Surya |
|--------|--------|-------|
| **1** | Foundation + Install deps + Config | Virtual Lab Core (Workbench, Toolbox) |
| **2** | UI Components + Backend Extensions | Virtual Lab Core (Controls, Runner) |
| **3** | Public Pages (Home, Praktikum, Pengumuman) | Virtual Lab Pages + Admin Layout |
| **4** | Auth + Notifications + More pages | Admin Dashboard (DataTable, CRUD pages) |
| **5** | File Handling + Offline | Admin Dashboard (remaining) |
| **6** | Integration + Testing | Integration + Testing |
| **7** | Polish + Bug fixes | Polish + Bug fixes |

**Total Estimasi**: 6-7 minggu

---

## Code Quality Requirements

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- All functions typed
- All props interfaces defined

### Testing
- All UI components tested
- All hooks tested
- Critical flows integration tested
- Minimum 70% coverage target

### Formatting
- Prettier on save
- ESLint no errors
- Consistent imports order

### Git
- Conventional commits
- Feature branches
- PR reviews

---

## Development Workflow

1. **Before coding**: Read this plan
2. **Before PR**: Run `npm run lint && npm run format:check && npm test`
3. **PR checklist**:
   - [ ] TypeScript no errors
   - [ ] Tests passing
   - [ ] Prettier formatted
   - [ ] Dark mode tested
   - [ ] Offline behavior tested (if applicable)

---

## Notes & Reminders

### Web → Mobile Adaptations
| Web | Mobile |
|-----|--------|
| Hover states | Press states + haptic |
| Drag & drop | Tap to add/select |
| Backdrop blur | Opacity overlay |
| HTML table | FlatList + custom rows |
| CSS gradients | expo-linear-gradient |
| localStorage | expo-secure-store / AsyncStorage |

### Testing on Device
- Push notifications: Physical device only
- Haptics: Physical device only
- File system: Works on simulator

### Environment Variables
```
# .env (React Native)
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000  # Local dev
EXPO_PUBLIC_API_URL=https://api.labkidasitb.com  # Production
```

---

*Dokumen ini adalah single source of truth untuk project ini.*
*Update dokumen ini jika ada perubahan keputusan.*
