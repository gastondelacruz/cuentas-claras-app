# design-tokens Specification

## Purpose

Defines the color palette, typography constants, spacing and border-radius scales for the app. All tokens are exported from `src/shared/theme/` and wired into NativeWind's Tailwind config. Bootstrap values are explicit (user-provided); neutral/semantic tokens are placeholders pending the "Luminous Finance" reconciliation task.

---

## Requirements

### Requirement: Color Token Exports

`src/shared/theme/colors.ts` MUST export named color constants. The three explicit brand tokens MUST match the user-specified values exactly. Neutral and semantic slots MUST be present as documented placeholders.

| Token | Value | Role |
|-------|-------|------|
| `primary` | `#0E7A3A` | Primary actions, buttons |
| `debt` | `#DC2626` | Debt/unsettled amounts |
| `accent` | `#F97316` | Highlights, secondary actions |
| `neutral100` | `#F9FAFB` | Lightest background (placeholder) |
| `neutral900` | `#111827` | Darkest text (placeholder) |
| `success` | `#16A34A` | Positive states (placeholder) |
| `error` | `#DC2626` | Error states (maps to debt) |

#### Scenario: Exact brand token values are exported

- GIVEN `colors.ts` is imported in a test
- WHEN `colors.primary`, `colors.debt`, and `colors.accent` are read
- THEN their values are `'#0E7A3A'`, `'#DC2626'`, and `'#F97316'` respectively

#### Scenario: Neutral placeholders are string values

- GIVEN `colors.ts` is imported
- WHEN `colors.neutral100` and `colors.neutral900` are read
- THEN both are non-empty strings matching the hex color pattern `/^#[0-9A-Fa-f]{6}$/`

---

### Requirement: Typography Constants

`src/shared/theme/typography.ts` MUST export a font-family reference for Inter and a numeric scale for font sizes and line heights.

| Export | Value |
|--------|-------|
| `fontFamily.sans` | `'Inter'` |
| `fontSize.sm` | `14` |
| `fontSize.base` | `16` |
| `fontSize.lg` | `18` |
| `fontSize.xl` | `20` |
| `fontSize.h1` | `28` |

#### Scenario: Font family constant is the string 'Inter'

- GIVEN `typography.ts` is imported
- WHEN `typography.fontFamily.sans` is read
- THEN it equals `'Inter'`

#### Scenario: Font size scale is numeric and ordered

- GIVEN `typography.ts` is imported
- WHEN font size values are read
- THEN `fontSize.sm < fontSize.base < fontSize.lg < fontSize.xl < fontSize.h1`

---

### Requirement: Spacing and Border Radius Scales

`src/shared/theme/spacing.ts` MUST export a spacing scale keyed by integer steps (1–10, mapped to multiples of 4px). `src/shared/theme/radius.ts` MUST export border-radius values for `sm`, `md`, `lg`, and `full`.

#### Scenario: Spacing scale follows 4px grid

- GIVEN `spacing.ts` is imported
- WHEN `spacing[1]` through `spacing[4]` are read
- THEN they equal `4`, `8`, `12`, `16` respectively

#### Scenario: Border radius tokens are exported

- GIVEN `radius.ts` is imported
- WHEN `radius.sm`, `radius.md`, `radius.lg`, `radius.full` are read
- THEN all four are defined and `radius.sm < radius.md < radius.lg`

---

### Requirement: NativeWind Theme Wiring

`tailwind.config.js` MUST extend the default theme with the token values from `src/shared/theme/` so that NativeWind class names like `bg-primary`, `text-debt`, and `text-accent` resolve to the correct hex values.

#### Scenario: Custom color classes resolve in NativeWind

- GIVEN `tailwind.config.js` imports the colors object
- WHEN `theme.extend.colors` is inspected
- THEN `colors.primary`, `colors.debt`, and `colors.accent` are present with correct hex values

#### Scenario: Inter font is loaded via expo-font

- GIVEN `AppProviders` loads the Inter font with `expo-font`
- WHEN the app starts
- THEN `useFonts` returns `fontsLoaded: true` before the navigation tree renders
- AND the app does not render until fonts are ready (splash screen held or conditional render)
