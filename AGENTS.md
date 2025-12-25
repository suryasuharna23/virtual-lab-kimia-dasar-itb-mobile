# AGENTS.md - Lab Kimia Dasar Mobile App

## Project Structure
- **Mobile App**: Expo SDK 54 + React Native 0.81 + expo-router (this folder)
- **Backend**: `../../backend/` - Express.js + Supabase
- **Web Frontend**: `../../frontend/` - Next.js 15 (reference only)

## Important Documentation
- **PORTING_PLAN.md** - Complete implementation plan, features, task division, timeline
- **DESIGN_SYSTEM.md** - UI/UX design guidelines, colors, typography, components

## Commands
```bash
npm run start          # Start Expo dev server
npm run lint           # ESLint check
npm run test           # Run all tests (jest-expo)
npm run test -- Button # Run single test file matching "Button"
npm run format         # Prettier format all files
npm run format:check   # Check formatting without writing
```

## Code Style
- **TypeScript**: Strict mode enabled. No `any` types. All functions and props must be typed.
- **Formatting**: Prettier with `semi: false`, `singleQuote: true`, `tabWidth: 2`, `printWidth: 100`
- **Imports**: Use `@/*` path alias. Group: react → expo → third-party → local
- **Naming**: PascalCase components, camelCase functions/variables, UPPER_SNAKE constants
- **Components**: Functional only. Props interface named `{ComponentName}Props`
- **Error handling**: Never empty catch blocks. Use typed errors.

## Testing
- Framework: Jest + `@testing-library/react-native`
- All UI components in `components/` must have corresponding `.test.tsx` in `__tests__/`
- Run before PR: `npm run lint && npm run format:check && npm test`

## Design System (from DESIGN_SYSTEM.md)

### Style
- **Theme**: Soft, Friendly, Modern Education App (Duolingo-style)
- **Aesthetic**: Rounded corners, soft shadows, warm accents

### Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `#1E1B4B` | `#E8E6F2` | Buttons, headers |
| Accent | `#F59E0B` | `#F59E0B` | Highlights, badges, CTAs |
| Background | `#F5F3FF` | `#0F0E1A` | App background |
| Surface | `#FFFFFF` | `#1E1B2E` | Cards, modals |

### Typography
- Display: 32px/Bold - Hero text
- H1: 28px/Bold - Page titles
- H2: 24px/SemiBold - Section headings
- Body: 14px/Regular - Default text
- Caption: 11px/Medium - Labels

### Spacing (4px grid)
- `xs`: 4px, `sm`: 8px, `md`: 12px, `lg`: 16px, `xl`: 24px, `2xl`: 32px

### Border Radius
- `sm`: 8px, `md`: 12px, `lg`: 16px, `xl`: 20px, `full`: 9999px (pills)

### Components
- **Buttons**: Pill-shaped (full radius), Primary/Secondary/Accent/Ghost variants
- **Cards**: Rounded (16-20px), soft shadows, Standard/Colored/Floating types
- **Inputs**: 12px radius, 1px border, focus state with primary tint

### Icons
- Use `@expo/vector-icons` (Ionicons or Feather)
- Sizes: xs=16, sm=20, md=24, lg=32, xl=48

### Animation
- Fast: 150ms (buttons), Normal: 250ms (cards), Slow: 400ms (transitions)
- Use spring animations for playful feel
- Haptics: Light (taps), Medium (success), Heavy (errors)

## Key Decisions (from PORTING_PLAN.md)
- Virtual Lab data bundled in `constants/practicums.ts` (offline-first)
- Auth tokens stored in `expo-secure-store` (not AsyncStorage)
- Admin area uses drawer navigation at `app/(admin)/`
- Dark mode required for all components via ThemeContext
- Custom components (no UI library) following DESIGN_SYSTEM.md
