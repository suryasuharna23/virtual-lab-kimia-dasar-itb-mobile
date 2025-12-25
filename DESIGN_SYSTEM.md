# Design System - Lab Kimia Dasar ITB Mobile

> **Style**: Soft, Friendly, Modern Education App
> **Inspiration**: Duolingo-style learning app dengan warm accents dan rounded components
> **Last Updated**: 24 Desember 2025

---

## Color Palette

### Primary Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary** | `#1E1B4B` | `#E8E6F2` | Buttons, headers, primary actions |
| **Primary Light** | `#3730A3` | `#C4B5FD` | Hover states, secondary elements |
| **Primary Soft** | `#EDE9FE` | `#2E2A5E` | Card backgrounds, subtle highlights |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Accent** | `#F59E0B` | Highlights, badges, achievements, CTAs |
| **Accent Light** | `#FCD34D` | Icons, soft highlights |
| **Accent Soft** | `#FEF3C7` | Badge backgrounds, notifications |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#10B981` | Completed, correct, positive feedback |
| **Success Soft** | `#D1FAE5` | Success backgrounds |
| **Warning** | `#F59E0B` | Alerts, pending states |
| **Warning Soft** | `#FEF3C7` | Warning backgrounds |
| **Error** | `#EF4444` | Errors, destructive actions |
| **Error Soft** | `#FEE2E2` | Error backgrounds |
| **Info** | `#3B82F6` | Information, links |
| **Info Soft** | `#DBEAFE` | Info backgrounds |

### Neutral Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Background** | `#F5F3FF` | `#0F0E1A` | App background |
| **Surface** | `#FFFFFF` | `#1E1B2E` | Cards, modals |
| **Surface Elevated** | `#FFFFFF` | `#2A2744` | Elevated cards, dropdowns |
| **Border** | `#E5E7EB` | `#3B3756` | Dividers, borders |
| **Text Primary** | `#1E1B4B` | `#F5F3FF` | Headings, primary text |
| **Text Secondary** | `#6B7280` | `#9CA3AF` | Descriptions, labels |
| **Text Muted** | `#9CA3AF` | `#6B7280` | Placeholders, disabled |

### Chemistry-Specific Colors (Virtual Lab)

| Name | Hex | Usage |
|------|-----|-------|
| **pH Acidic** | `#EF4444` | pH < 7, acidic solutions |
| **pH Neutral** | `#22C55E` | pH = 7, neutral |
| **pH Basic** | `#3B82F6` | pH > 7, basic solutions |
| **Liquid Blue** | `#60A5FA` | Water, blue solutions |
| **Liquid Green** | `#4ADE80` | Green solutions |
| **Liquid Yellow** | `#FACC15` | Yellow solutions |
| **Liquid Orange** | `#FB923C` | Orange solutions |
| **Liquid Purple** | `#A78BFA` | Purple solutions |
| **Liquid Clear** | `#E5E7EB` | Clear/colorless |

---

## Typography

### Font Family

```typescript
const fontFamily = {
  // Primary: System font with rounded variant for friendly feel
  sans: Platform.select({
    ios: 'System', // SF Pro
    android: 'Roboto',
    default: 'System',
  }),
  
  // For headings - use font weight to differentiate
  heading: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Monospace for code/data
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
}
```

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| **Display** | 32px | 40px | 700 (Bold) | Hero text, welcome messages |
| **H1** | 28px | 36px | 700 (Bold) | Page titles |
| **H2** | 24px | 32px | 600 (SemiBold) | Section headings |
| **H3** | 20px | 28px | 600 (SemiBold) | Card titles |
| **H4** | 18px | 24px | 600 (SemiBold) | Subsection titles |
| **Body Large** | 16px | 24px | 400 (Regular) | Primary content |
| **Body** | 14px | 20px | 400 (Regular) | Default text |
| **Body Small** | 12px | 16px | 400 (Regular) | Secondary info |
| **Caption** | 11px | 14px | 500 (Medium) | Labels, timestamps |
| **Overline** | 10px | 14px | 600 (SemiBold) | Category labels, uppercase |

### Font Weights

```typescript
const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

---

## Spacing System

Based on 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing, inline elements |
| `sm` | 8px | Between related elements |
| `md` | 12px | Default component padding |
| `lg` | 16px | Card padding, section gaps |
| `xl` | 24px | Between sections |
| `2xl` | 32px | Major section separators |
| `3xl` | 48px | Page padding top/bottom |
| `4xl` | 64px | Hero sections |

### Layout Spacing

```typescript
const layout = {
  screenPaddingHorizontal: 16,
  screenPaddingTop: 16,
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  listItemGap: 12,
}
```

---

## Border Radius

Rounded, friendly aesthetic:

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | Sharp edges (rare) |
| `sm` | 8px | Small elements, tags |
| `md` | 12px | Inputs, small cards |
| `lg` | 16px | Cards, modals |
| `xl` | 20px | Large cards, bottom sheets |
| `2xl` | 24px | Hero cards, featured content |
| `full` | 9999px | Pills, avatars, circular buttons |

---

## Shadows

Soft, diffused shadows for floating effect:

```typescript
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  lg: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  
  xl: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
}
```

---

## Components

### Buttons

#### Primary Button
```
- Background: Primary (#1E1B4B)
- Text: White
- Border Radius: full (pill shape)
- Padding: 16px horizontal, 14px vertical
- Font: Body Large, SemiBold
- Shadow: md
- Press state: opacity 0.9, scale 0.98
```

#### Secondary Button
```
- Background: Primary Soft (#EDE9FE)
- Text: Primary (#1E1B4B)
- Border Radius: full
- Padding: 16px horizontal, 14px vertical
- Font: Body Large, SemiBold
- Shadow: sm
```

#### Accent Button
```
- Background: Accent (#F59E0B)
- Text: White
- Border Radius: full
- Used for: rewards, special CTAs
```

#### Ghost Button
```
- Background: transparent
- Text: Primary
- Border: 1px Primary Light
- Border Radius: full
```

### Cards

#### Standard Card
```
- Background: Surface (White / #1E1B2E dark)
- Border Radius: lg (16px)
- Padding: lg (16px)
- Shadow: md
- Border: none
```

#### Colored Card (Featured)
```
- Background: Primary Soft (#EDE9FE) or Accent Soft (#FEF3C7)
- Border Radius: xl (20px)
- Padding: lg (16px)
- Shadow: sm
- Use for: Featured content, stats, highlights
```

#### Floating Card
```
- Same as Standard Card
- Shadow: lg
- Use for: Overlapping layouts, modals
```

### Input Fields

```
- Background: Surface
- Border: 1px Border color
- Border Radius: md (12px)
- Padding: 12px 16px
- Font: Body
- Focus state: Border Primary, shadow sm with primary tint
- Error state: Border Error, Error Soft background
```

### Badges

#### Pill Badge
```
- Background: Accent Soft / Primary Soft / colored backgrounds
- Text: Accent / Primary / matching text color
- Border Radius: full
- Padding: 4px 12px
- Font: Caption, Medium
```

#### Icon Badge
```
- Background: Accent
- Icon: White
- Size: 32x32 or 40x40
- Border Radius: md (12px)
- Shadow: sm
```

### Navigation

#### Bottom Tab Bar
```
- Background: Surface with blur (if supported)
- Border Top: 1px Border color (subtle)
- Shadow: lg (above)
- Active icon: Primary
- Inactive icon: Text Muted
- Active indicator: Accent dot or Primary background pill
```

#### Header
```
- Background: transparent or Background
- Title: H2 or H3
- Safe area aware
- Optional: gradient overlay on hero pages
```

---

## Iconography

### Style
- **Set**: @expo/vector-icons (Ionicons or Feather preferred)
- **Style**: Rounded, friendly
- **Stroke width**: 1.5-2px
- **Filled icons**: For active/selected states

### Sizes
| Size | Value | Usage |
|------|-------|-------|
| `xs` | 16px | Inline, badges |
| `sm` | 20px | Buttons, inputs |
| `md` | 24px | Default, navigation |
| `lg` | 32px | Feature icons |
| `xl` | 48px | Empty states, illustrations |

---

## Motion & Animation

### Principles
- **Quick & Responsive**: 150-200ms for micro-interactions
- **Smooth & Fluid**: 300-400ms for page transitions
- **Bouncy**: Use spring animations for playful feel

### Timing
```typescript
const timing = {
  fast: 150,      // Buttons, toggles
  normal: 250,    // Cards, reveals
  slow: 400,      // Page transitions
  spring: {       // Bouncy effects
    damping: 15,
    stiffness: 150,
  },
}
```

### Haptics
- **Light**: Button taps, toggles
- **Medium**: Success actions, achievements
- **Heavy**: Errors, destructive actions

---

## Patterns

### Greeting Header
```
┌─────────────────────────────────┐
│ [Avatar] Name        [Icons]    │
│          Level/Badge            │
├─────────────────────────────────┤
│                                 │
│  Hi, Ready to learn?            │  ← Display, Bold
│  Continue your progress         │  ← Body, Secondary color
│                                 │
└─────────────────────────────────┘
```

### Feature Card (Colored Background)
```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐    │
│  │ [Icon]  Title           │    │  ← Primary Soft BG
│  │         Subtitle        │    │
│  │  [Progress/Stats]       │    │
│  │                         │    │
│  │    [CTA Button]         │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### Course/Module Card (2-Column Grid)
```
┌──────────────┐  ┌──────────────┐
│   [Icon]     │  │   [Icon]     │
│              │  │              │
│  Title       │  │  Title       │
│  Progress %  │  │  Progress %  │
└──────────────┘  └──────────────┘
```

### Achievement Modal
```
┌─────────────────────────────────┐
│              ×                  │
│                                 │
│         [Large Icon]            │  ← Accent color, animated
│                                 │
│        Congrats!                │  ← Display, Bold
│    You achieved X               │  ← Body, Secondary
│                                 │
│    ┌─────────────────────┐      │
│    │   Continue Button   │      │  ← Primary, full width
│    └─────────────────────┘      │
└─────────────────────────────────┘
```

---

## Dark Mode

### Approach
- Invert backgrounds, keep accent colors vibrant
- Reduce contrast slightly for eye comfort
- Shadows become more subtle (lower opacity)
- Primary color inverts (dark bg → light text)

### Color Mapping
| Element | Light | Dark |
|---------|-------|------|
| Background | `#F5F3FF` | `#0F0E1A` |
| Surface | `#FFFFFF` | `#1E1B2E` |
| Primary (text/icons) | `#1E1B4B` | `#E8E6F2` |
| Accent | `#F59E0B` | `#F59E0B` (unchanged) |
| Shadows | 8-15% opacity | 20-30% opacity (darker tint) |

---

## Accessibility

### Minimum Requirements
- Touch targets: 44x44px minimum
- Color contrast: 4.5:1 for text, 3:1 for UI
- Focus indicators: visible and clear
- Semantic labels for screen readers

### Font Scaling
- Support Dynamic Type (iOS) / Font Scaling (Android)
- Set min/max font sizes
- Test at 200% scale

---

## Implementation Notes

### React Native Specific
1. Use `react-native-reanimated` for smooth animations
2. Use `expo-haptics` for haptic feedback
3. Use `expo-linear-gradient` for gradient backgrounds
4. Use `@gorhom/bottom-sheet` for modals/sheets

### Component Library
- Build custom components (no UI library)
- Each component supports `light` and `dark` via ThemeContext
- All components tested with React Native Testing Library

### File Naming
```
components/
├── ui/
│   ├── Button.tsx           # Component
│   ├── Button.test.tsx      # Tests (in __tests__/ folder)
│   └── index.ts             # Barrel export
```

---

## Quick Reference: Color Tokens

```typescript
// constants/theme.ts - Core color tokens

export const colors = {
  // Primary
  primary: '#1E1B4B',
  primaryLight: '#3730A3',
  primarySoft: '#EDE9FE',
  
  // Accent (Warm Orange)
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentSoft: '#FEF3C7',
  
  // Semantic
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  error: '#EF4444',
  errorSoft: '#FEE2E2',
  info: '#3B82F6',
  infoSoft: '#DBEAFE',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  
  // Chemistry (Virtual Lab)
  chemistry: {
    acidic: '#EF4444',
    neutral: '#22C55E',
    basic: '#3B82F6',
    liquidBlue: '#60A5FA',
    liquidGreen: '#4ADE80',
    liquidYellow: '#FACC15',
    liquidOrange: '#FB923C',
    liquidPurple: '#A78BFA',
    liquidClear: '#E5E7EB',
  },
}

export const lightTheme = {
  background: '#F5F3FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
}

export const darkTheme = {
  background: '#0F0E1A',
  surface: '#1E1B2E',
  surfaceElevated: '#2A2744',
  border: '#3B3756',
  textPrimary: '#F5F3FF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
}
```

---

*Dokumen ini adalah referensi desain untuk seluruh app. Semua komponen harus mengikuti guidelines ini.*
